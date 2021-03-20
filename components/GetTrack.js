const SpotifyWebApi = require('spotify-web-api-node');
const cardUtil = require('../utils/cardUtil');

module.exports = {
  metadata: () => ({
    name: 'Custom.MusicSearcher',
    properties: {
      track: {
        required: true,
        type: 'string'
      },
      offset: {
        required: true,
        type: 'int'
      },
      clientId: {
        required: true,
        type: 'string'
      },
      clientSecret: {
        required: true,
        type: 'string'
      }
    },
    supportedActions: ['success', 'failure', 'listenNow', 'increment']
  }),
  invoke: async (conversation, done) => {
    //load conversation properties
    const {
      track,
      offset,
      clientId,
      clientSecret,
    } = conversation.properties();

    //setUp Spotify Client
    const spotifyApi = new SpotifyWebApi({
      clientId,
      clientSecret
    });

    try {
      //Perform Spotify Request
      const clientCredentialsResponse = await spotifyApi.clientCredentialsGrant()
      spotifyApi.setAccessToken(clientCredentialsResponse.body['access_token']);
      const searchTrackResponse = await spotifyApi.searchTracks(track, {
        limit: 4,
        offset
      })
      var tracksData = searchTrackResponse.body.tracks.items.map(element => {
        return {
          name: element.name,
          external_urls: element.external_urls.spotify,
          images: element.album.images,
          preview_url: element.preview_url,
          musicId: element.id
        }
      })
      const cards = tracksData.map(element => {
        return cardUtil.renderCards(element, conversation)
      });
      var cardsResponse = conversation.MessageModel().cardConversationMessage('horizontal', cards);
      cardResponse =  cardUtil.searchMoreAction(cardsResponse, conversation);
      conversation.logger().info('Replying with card response');
      conversation.reply(cardsResponse);
      conversation.transition('increment');
      // conversation.transition('success');
      // conversation.keepTurn(true);
      done();
    } catch (error) {
      conversation.transition('failure');
      conversation.logger().info('Something went wrong when retrieving a track', error);
      done();
    }
  }
};