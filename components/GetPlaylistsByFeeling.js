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
    const clientCredentialsResponse = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(clientCredentialsResponse.body['access_token']);

    if (conversation.postback()) {
      conversation.keepTurn(true);
      conversation.transition(conversation.postback().action);
      done();
    } else {
      try {
        await getPlaylistByFeeling(feeling, offset, spotifyApi, conversation);
        conversation.variable('offset', 4);
        done();
      } catch (error) {
        conversation.transition('failure');
        conversation.logger().info(error);
        done();
      }
    }
  }
};
