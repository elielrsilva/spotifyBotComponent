const SpotifyWebApi = require('spotify-web-api-node');

module.exports = {
    metadata: () => ({
        name: "GetPlaylistsByFeeling",
        properties: {
            feeling: { required: true, type: 'string' },
            offset: { required: true, type: 'int' },
            clientId: { required: true, type: 'string' },
            clientSecret: { required: true, type: 'string' }
        },
        supportedActions: ['success', 'failure']
    }),
    invoke: async(conversation, done) => {
        const { feeling, offset, clientId, clientSecret } = conversation.properties();
        const { offset } = conversation.properties();

        conversation.logger().info(offset);

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

        // Search playlists whose name or description contains 'workout'
        spotifyApi.searchPlaylists(feeling, { 
                limit : 4,
                offset : offset
            })
            .then(function(data) {
                let playlistsData;
                let cards;
                
                playlistsData = data.body.playlists.items.map( element => {
                    return {
                        description: element.description,
                        href: element.href,
                        name: element.name,
                        images: element.images,
                        external_urls: element.external_urls
                    }
                });

                cards = playlistsData.map(element => {
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
                conversation.logger().info(err);
                done();
        });
    }
};

function renderCards(playlist, conversation) {
    var actions = [];
    // actions.push(
    //     conversation.MessageModel().urlActionObject(
    //         'Listen now', null, playlist.external_urls.spotify)
    // );

    return conversation.MessageModel().cardObject(
        playlist.name,
        playlist.description,
        playlist.images[0].url, null, actions);

};