const cardUtil = require('../utils/cardUtil');

module.exports = {
  getPlaylistByCategory: async (genre, offset, spotifyApi, conversation) => {
    const searchPlaylistResponse = await spotifyApi.getPlaylistsForCategory(genre, {
      country: 'BR',
      limit: 4,
      offset
    })
    const playlistData = searchPlaylistResponse.body.playlists.items.map(element => {
      return {
        name: element.name,
        external_urls: element.external_urls.spotify,
        images: element.images,
        type: element.type,
        musicId: element.id
      }
    });
    const cards = playlistData.map(element => {
      return cardUtil.renderCards(element, conversation)
    });

    var cardsResponse = conversation.MessageModel().cardConversationMessage('horizontal', cards);
    cardResponse =  cardUtil.searchMoreAction(cardsResponse, conversation);
    conversation.logger().info('Replying with card response');
    conversation.reply(cardsResponse);
  },

}