const SpotifyWebApi = require('spotify-web-api-node');
const spotifyUtil = require('../utils/spotifyUtil');

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
    supportedActions: ['success', 'failure', 'listenNow', 'increment']
  }),
  invoke: async (conversation, done) => {
    const {
      genre,
      offset,
      clientId,
      clientSecret,
    } = conversation.properties();
    var spotifyApi = new SpotifyWebApi({
      clientId,
      clientSecret
    });
    const clientCredentialsResponse = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(clientCredentialsResponse.body['access_token']);

    if (conversation.postback()) {
      //consulta para o spotify
      await spotifyUtil.getPlaylistByCategory(genre, offset, spotifyApi, conversation);
      conversation.keepTurn(false);
      conversation.transition(conversation.postback().action);
      done();
    } else {
      try {
        await spotifyUtil.getPlaylistByCategory(genre, offset, spotifyApi, conversation);
        conversation.variable('offset', 4);
        done();
      } catch (error) {
        conversation.transition('failure');
        conversation.logger().info('Something went wrong when retrieving an access token', error);
        done();
      }
    }
  }
};