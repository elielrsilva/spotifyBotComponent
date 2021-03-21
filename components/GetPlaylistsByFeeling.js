const SpotifyWebApi = require('spotify-web-api-node');
const cardUtil = require('../utils/cardUtil');

module.exports = {
  metadata: () => ({
    name: "Custom.GetPlaylistsByFeeling",
    properties: {
      feeling: {
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
    const {
      feeling,
      offset,
      clientId,
      clientSecret,
    } = conversation.properties();
    var spotifyApi = new SpotifyWebApi({
      clientId,
      clientSecret
    });

    if (conversation.postback()) {
      conversation.keepTurn(true);
      conversation.transition(conversation.postback().action);
      done();
    } else {
      try {
        const clientCredentialsResponse = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(clientCredentialsResponse.body['access_token']);
        const searchPlaylistResponse = await spotifyApi.searchPlaylists(feeling, {
          country: 'BR',
          limit: 4,
          offset
        })
        const playlistData = searchPlaylistResponse.body.playlists.items.map(element => {
          return {
            name: element.name,
            external_urls: element.external_urls.spotify,
            images: element.images,
            type: element.type,
            musicId: element.id
          }
        });
        const cards = playlistData.map(element => {
          return cardUtil.renderCards(element, conversation)
        });
    
        var cardsResponse = conversation.MessageModel().cardConversationMessage('horizontal', cards );
        cardResponse =  cardUtil.searchMoreAction(cardsResponse, conversation);
        conversation.logger().info('Replying with card response');
        conversation.reply(cardsResponse);
        done();
      } catch (error) {
        conversation.transition('failure');
        conversation.logger().info(error);
        done();
      }
    }
  }
};
