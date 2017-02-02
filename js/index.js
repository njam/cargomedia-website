const prismic = require('./prismic');
const _ = require('underscore');

var loadMembers = function(prismicQuery) {
  return prismicQuery([
    prismic.Prismic.Predicates.at('document.type', 'members')
  ]).then(function(response) {
    return response.results[0];
  });
};

function extractUrlDomain(url) {
  var a = document.createElement('a');
  a.href = url;
  var hostParts = a.hostname.split('.');
  return hostParts[hostParts.length - 2];
}

function renderMember(container, template, member) {
  var applyJob = container.querySelector('.applyJob');
  var renderedMember = template({member: member});
  if (applyJob) {
    applyJob.insertAdjacentHTML('beforebegin', renderedMember)
  } else {
    container.insertAdjacentHTML('beforeend', renderedMember);
  }
}

prismic.getApi()
  .then(function(api) {
    loadMembers(api)
      .then(function(memberList) {
        memberList = memberList.getGroup('members.member').toArray();
        var staffElement = document.querySelector('.staff');
        var consultantsElement = document.querySelector('.consultants');
        var memberTplText = document.querySelector('.tpl-member-card');
        var memberTpl = _.template(memberTplText.textContent);
        memberList.forEach(function(member) {
          var data = {
            avatar: member.getImage('avatar').url,
            name: member.getText('name'),
            position: member.getText('position')
          };
          var link = member.getLink('profile-link');
          if (link) {
            link = link.asText();
            data.link = link;
            var contact = extractUrlDomain(link);
            data.contact = contact.charAt(0).toUpperCase() + contact.slice(1);
          }
          switch (member.getText('type')) {
            case 'consultant':
              renderMember(consultantsElement, memberTpl, data);
              break;
            case 'staff':
              renderMember(staffElement, memberTpl, data);
              break;
          }
        });
      })
  });