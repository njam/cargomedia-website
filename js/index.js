const prismic = require('./prismic');
const _ = require('underscore');

var loadMembers = function(prismicQuery) {
  return prismicQuery([
    prismic.Prismic.Predicates.at('document.type', 'team-member')
  ]).then(function(response) {
    return response.results;
  });
};

function extractUrlDomain(url) {
  var a = document.createElement('a');
  a.href = url;
  var hostParts = a.hostname.split('.');
  return hostParts[hostParts.length - 2];
}

prismic.getApi()
  .then(function(api) {
    loadMembers(api)
      .then(function(memberList) {
        memberList = _.sortBy(memberList, function(member) {
          return member.getText('team-member.name').toLowerCase();
        });
        var membersElement = document.querySelector('.members');
        var consultantsElement = document.querySelector('.consultants');
        var memberTplText = document.querySelector('.tpl-member-card');
        var memberTpl = _.template(memberTplText.textContent);
        memberList.forEach(function(member) {
          var data = {
            avatar: member.getImage('team-member.avatar').url,
            name: member.getText('team-member.name'),
            position: member.getText('team-member.position')
          };
          var link = member.getLink('team-member.profile-link');
          if (link) {
            link = link.asText();
            data.link = link;
            var contact = extractUrlDomain(link);
            data.contact = contact.charAt(0).toUpperCase() + contact.slice(1);
          }
          if (member.tags && member.tags.indexOf('consultant') >= 0) {
            consultantsElement.insertAdjacentHTML('beforeend', memberTpl({member: data}));
          } else {
            membersElement.insertAdjacentHTML('beforeend', memberTpl({member: data}));
          }
        });
      })
  });