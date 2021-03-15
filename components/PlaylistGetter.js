const SpotifyWebApi = require('spotify-web-api-node');
const cardUtil = require('../utils/cardUtil');

module.exports = {
  metadata: () => ({
    name: 'Custom.PlaylistGetter',
    properties: {
      genre: {
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
    supportedActions: ['success', 'failure']
  }),
  invoke: async (conversation, done) => {
    const {
      genre,
      offset,
      clientId,
      clientSecret
    } = conversation.properties();
    var spotifyApi = new SpotifyWebApi({
      clientId,
      clientSecret
    });

    try {
      const clientCredentialsResponse = await spotifyApi.clientCredentialsGrant();
      spotifyApi.setAccessToken(clientCredentialsResponse.body['access_token']);
      const searchPlaylistResponse = await spotifyApi.getPlaylistsForCategory(genre, {
        country: 'BR',
        limit: 4,
        offset
      })
      const playlistData = searchPlaylistResponse.body.playlists.items.map(element => {
        return {
          description: element.description,
          href: element.href,
          name: element.name,
          images: element.images,
          external_urls: element.external_urls
        }
      });
      const cards = playlistData.map(element => {
        return cardUtil.renderCards(element, conversation)
      });
  
      const cardsResponse = conversation.MessageModel().cardConversationMessage('horizontal', cards);
      conversation.logger().info('Replying with card response');
      conversation.reply(cardsResponse);
      conversation.transition('success');
      conversation.keepTurn(true);
      done();
    } catch (error) {
      conversation.transition('failure');
      conversation.logger().info('Something went wrong when retrieving an access token', err);
      done();
    }
  }
};