module.exports = {
  //function to render a CardObject
  renderCards: (playlist, conversation) => {
    var actions = [];
    actions.push(
      conversation.MessageModel().urlActionObject(
        'Listen now', null, playlist.external_urls)
    );
  
    return conversation.MessageModel().cardObject(
      playlist.name, null,
      playlist.images[0].url, null, actions)
  }
}