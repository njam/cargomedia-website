const Prismic = require('prismic.io');
const queryString = require('query-string');

var prismicApiPromise;

module.exports = {
  Prismic: Prismic,
  getApi: function() {
    if (!prismicApiPromise) {
      prismicApiPromise = Prismic.api('https://cargomediach.prismic.io/api')
        .then(function(api) {
          var prismicRef = queryString.parse(location.search)['token'];
          return function(q) {
            return api.query(q, {ref: prismicRef});
          };
        });
    }
    return prismicApiPromise;
  }
};
