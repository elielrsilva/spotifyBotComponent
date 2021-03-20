module.exports = {
    metadata: () => ({
        name: 'Custom.RenderIframe',
        supportedActions: ['success', 'failure']
    }),
    invoke: (conversation, done) => {
        if (conversation.postback() && !!conversation.postback().variables.musicId){
            // conversation.reply(`<iframe src="https://open.spotify.com/embed/track/${conversation.postback().variables.musicId}" width="225" height="385" frameborder="0" allowtransparency="false" allow="encrypted-media"></iframe>`);
            var urlAction = conversation.MessageModel().urlActionObject( 'Escutar no Spotify!', null, conversation.postback().variables.externalLink);
            var textConversation = conversation.MessageModel().textConversationMessage(
                `<iframe src="https://open.spotify.com/embed/track/${conversation.postback().variables.musicId}" width="225" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`,
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