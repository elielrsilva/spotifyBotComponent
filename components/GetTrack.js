const SpotifyWebApi = require('spotify-web-api-node');

module.exports = {
    metadata: () => ({
        name: 'MusicSearcher',
        properties: {
            track: { required: true, type: 'string' },
            offset: { required: true, type: 'int' },
            clientId: { required: true, type: 'string' },
            clientSecret: { required: true, type: 'string' }
        },
        supportedActions: ['success', 'failure']
    }),
    invoke: async(conversation, done) => {

        // log in into spotify
        const { track, offset, clientId, clientSecret } = conversation.properties();

        var spotifyApi = new SpotifyWebApi({
            clientId,
            clientSecret
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
        
        // Search tracks whose name, album or artist contains 'Love'
        await spotifyApi.searchTracks(track, {
            limit: 4,
            offset: offset
        })
        .then(function(data) {
            let tracksData;
            let cards;

            tracksData = data.body.tracks.items.map(element => {
                return{
                    name: element.name,
                    external_urls: element.external_urls.spotify,
                    images: element.album.images,
                    preview_url: element.preview_url
                }
            })

            cards = tracksData.map(element => {
                return renderCards(element, conversation)
            });

            var cardsResponse = conversation.MessageModel().cardConversationMessage(
                'horizontal', cards);

            conversation.logger().info('Replying with card response');
            conversation.reply(cardsResponse);
            conversation.transition('success');
            conversation.keepTurn(true);
            done();


        }, function(err) {
            conversation.transition('failure');
            conversation.logger().info('Something went wrong when retrieving a track', err);
            done();
        });

    }
};

//Function to render 1 card
function renderCards(playlist, conversation) {
    var actions = [];
    actions.push(
        conversation.MessageModel().urlActionObject(
            'Listen now', null, playlist.external_urls)
    );

    return conversation.MessageModel().cardObject(
        playlist.name, null,
        playlist.images[0].url, null, actions);

}