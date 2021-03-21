module.exports = {
    metadata: () => ({
        name: 'Custom.RenderIframe',
        supportedActions: ['success', 'failure']
    }),
    invoke: (conversation, done) => {
        var type = conversation.postback().variables.type;

        if (conversation.postback() && !!conversation.postback().variables.musicId){
            var urlAction = conversation.MessageModel().urlActionObject( 'Escutar no Spotify!', null, conversation.postback().variables.externalLink);
            var textConversation = conversation.MessageModel().textConversationMessage(
                `<iframe src="https://open.spotify.com/embed/${type}/${conversation.postback().variables.musicId}" width="225" height="${ type == 'track'? '80' :'380' }" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`,
                null,
                'Clique no símbolo do Spotify para ver mais detalhes! 💚'
            )


            conversation.reply("Não quero ver ninguém parado! Solta o som DJ!")
            conversation.reply(textConversation);
            conversation.keepTurn(true);
            conversation.transition('success');
            done();
        }else{
            conversation.keepTurn(true)
            conversation.transition('failure');
            done();
        }
    }
}