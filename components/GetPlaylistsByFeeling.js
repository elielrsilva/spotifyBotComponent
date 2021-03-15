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
    supportedActions: ['success', 'failure']
  }),
  invoke: async (conversation, done) => {
    const {
      feeling,
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
      const searchPlaylistResponse = spotifyApi.searchPlaylists(feeling, {
        limit: 4,
        offset: offset
      })
      const playlistsData = searchPlaylistResponse.body.playlists.items.map(element => {
        return {
          description: element.description,
          href: element.href,
          name: element.name,
          images: element.images,
          external_urls: element.external_urls
        }
      });
  
      const cards = playlistsData.map(element => {
        return cardUtil.renderCards(element, conversation)
      });
  
      var cardsResponse = conversation.MessageModel().cardConversationMessage('horizontal', cards);
      conversation.logger().info('Replying with card response');
      conversation.reply(cardsResponse);
      conversation.transition('success');
      conversation.keepTurn(true);
      done();
    } catch (error) {
      conversation.transition('failure');
      conversation.logger().info(err);
      done();
    }
  }
};
