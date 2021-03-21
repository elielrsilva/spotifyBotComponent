module.exports = {
  metadata: () => ({
    name: 'Custom.HandlePostback',
    properties: {
      origem: {
        required: true,
        type: 'string'
      }
    },
    supportedActions: ['increment', 'listeNow']
  }),
  invoke: (conversation, done) => {
    const { origem }= conversation.properties();
    if (conversation.postback()) {
      conversation.keepTurn(true);
      conversation.transition(conversation.postback().action);
      done();
    }
  }
}