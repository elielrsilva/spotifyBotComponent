module.exports = {
    metadata: () => ({
        name: "BoiltheFrog",
        properties: {
            artist1: { required: true, type: 'string' },
            artist2: { required: true, type: 'string' },
        },
        supportedActions: ['success', 'failure']
    }),
    invoke: (conversation, done) => {
        //Execuções em segundo plano necessitam de async
        const { artist1, artist2 } = conversation.properties();

        conversation.logger().info("O artista 1 é:" + artist1); //Shift + Alt + Seta para baixo : Copia a linha
        conversation.logger().info("O artista 2 é:" + artist2);

        getBoiltheFrog(artist1, artist2, conversation).then(function(body) {

            if (body.path) {
                var playlists = body.path;
                conversation.variable("playlists", playlists)
                conversation.keepTurn(true);
                conversation.transition('success');
                done();



            } else {
                conversation.keepTurn(true);
                conversation.transition('failure');
                done();
            }


        })

    }
}

//Function fora do module.exports

function getBoiltheFrog(artist1, artist2, conversation) {
    return new Promise(function(resolve, reject) {
        try {
            const request = require('request');
            const queryString = require('query-string');

            var urlcomplete = queryString.stringifyUrl({ url: 'http://frog.playlistmachinery.com:4682/frog/path', query: { src: artist1, dest: artist2 } });

            var options = {
                'method': 'GET',
                'url': urlcomplete, //`http://frog.playlistmachinery.com:4682/frog/path?src=${artist1}&dest=${artist2}&skips=\n`,
                'headers': {}
            };
            request(options, function(error, response) {
                if (error) throw new Error(error);
                resolve(response.body);
                //Ao término da Promise, será disponibilizado o response.body
            });


        } catch (err) {
            conversation.variable('status', 'error');
            conversation.logger().info('erro :' + conversation.properties().status);

            console.error(err);
            reject(err);
        }
    })
}



// Receber Artista "A" e Artista "B"
// retornar um array de playlists