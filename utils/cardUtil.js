module.exports = {
  //function to render a CardObject
  renderCards: (playlist, conversation) => {
    var actions = [];
    actions.push(
      conversation.MessageModel().postbackActionObject(
        'Som na caixa Maestro!',
        null,
        { action: 'listenNow', variables: { musicId: playlist.musicId, type: playlist.type == 'track' ? 'track' : 'playlist'}}
      )
    );
    actions.push(
      conversation.MessageModel().urlActionObject(
        'Escutar no Spotify!',
        null,
        playlist.external_urls 
      )
    );
  
    return conversation.MessageModel().cardObject(
      playlist.name, 
      null,
      playlist.images[0].url, 
      null, 
      actions
      )
  },
  searchMoreAction: (cardsMessage, conversation) => {
    var actions= [];
    actions.push(
      conversation.MessageModel().postbackActionObject(
        'Ver mais',
        null,
        { action: 'increment' }
      )
    )
    return conversation.MessageModel().addGlobalActions(cardsMessage, actions);
  }
}