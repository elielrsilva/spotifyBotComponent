const SpotifyWebApi = require('spotify-web-api-node');

module.exports = {
  metadata: () => ({
    name: 'PlaylistGetter',
    properties: {
      genre: {required: true, type: 'string'},
      playlists: {required: true, type: 'string'}
    },
    supportedActions: ['success', 'failure']
  }),
  invoke: (conversation, done) => {
    const { genre } = conversation.properties();
    let result = {};

    var spotifyApi = new SpotifyWebApi({
      clientId: 'af48f26d07dd4483bb874984c69526c9',
      clientSecret: '6ab7cd0aeb7a4ead95354f59e798b162'
    });

    spotifyApi.clientCredentialsGrant().then(
      function(data) {
        spotifyApi.setAccessToken(data.body['access_token']);
    
        spotifyApi.getPlaylistsForCategory(genre, {
          country: 'BR',
          limit : 2,
          offset : 0
        })
        .then(function(data) {
          result = data.body.playlists.items.map( element => {
            return { "description": element.description, "href": element.href, "name": element.name, "images": element.images}
          })
        }, function(err) {
          conversation.logger().info(err);
        });
    
      },
      function(err) {
        conversation.logger().info('Something went wrong when retrieving an access token', err);
      }
    );
    
    conversation.transition('success');
    conversation.keepTurn(true);
    done();
  }
};