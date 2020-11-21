const SpotifyWebApi = require('spotify-web-api-node');

module.exports = {
  metadata: () => ({
    name: 'PlaylistGetter',
    properties: {
      genre: {required: true, type: 'string'},
    },
    supportedActions: ['success', 'failure']
  }),
  invoke: async (conversation, done) => {
    const { genre } = conversation.properties();

    var spotifyApi = new SpotifyWebApi({
      clientId: 'af48f26d07dd4483bb874984c69526c9',
      clientSecret: '6ab7cd0aeb7a4ead95354f59e798b162'
    });

    await spotifyApi.clientCredentialsGrant().then(
      function(data) {
        spotifyApi.setAccessToken(data.body['access_token']);
      },
      function(err) {
        conversation.transition('failure');
        conversation.logger().info('Something went wrong when retrieving an access token', err);
        done();
      }
    );

    await spotifyApi.getPlaylistsForCategory(genre, {
      country: 'BR',
      limit : 2,
      offset : 0
    })
    .then(function(data) {
      let playslistData;
      let cards;

      playslistData = data.body.playlists.items.map( element => {
        return { 
          description: element.description,
          href: element.href, 
          name: element.name, 
          images: element.images,
          external_urls: element.external_urls
        }
      });

      cards = playslistData.map( element => {
        return renderCards(element, conversation)
      });


      var cardsResponse = conversation.MessageModel().cardConversationMessage(
        'vertical', cards);
      conversation.logger().info('Replying with card response');
      conversation.reply(cardsResponse);
      
      conversation.transition('success');
      conversation.keepTurn(true);
      done();

    }, function(err) {

      conversation.transition('failure');
      conversation.logger().info(err);
      done();
    });
  }
};

//Function to render 1 card
function renderCards(playlist, conversation){
  var actions = [];
  actions.push(
    conversation.MessageModel().urlActionObject(
      'Listen now', null, playlist.external_urls.spotify) 
    );
  
  return conversation.MessageModel().cardObject(
    playlist.name,
    playlist.description,
    playlist.images[0].url, null, actions);

}