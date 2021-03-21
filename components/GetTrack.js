const SpotifyWebApi = require('spotify-web-api-node');
const cardUtil = require('../utils/cardUtil');
const { getTrack } = require('../utils/spotifyUtil');

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

    const spotifyApi = new SpotifyWebApi({
      clientId,
      clientSecret
    });
    const clientCredentialsResponse = await spotifyApi.clientCredentialsGrant()
    spotifyApi.setAccessToken(clientCredentialsResponse.body['access_token']);

    if (conversation.postback() && conversation.postback().action) {
      await getTrack(track, offset, spotifyApi, conversation);
      conversation.keepTurn(false);
      conversation.transition(conversation.postback().action);
      done();
    } else {
      try {
        await getTrack(track, offset, spotifyApi, conversation);
        conversation.variable('offset', 4);
        conversation.transition('success');
        done();
      } catch (error) {
        conversation.transition('failure');
        conversation.logger().info('Something went wrong when retrieving a track', error);
        done();
      }
    }
  }
};