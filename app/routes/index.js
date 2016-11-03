import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    const model = this.modelFor('application');
    if (!model) return this.transitionTo('login');

    const teams = model.teams;
    let team;
    try {
      team = teams.findBy('id', localStorage.lastTeamID);
    } catch (_err) {
      // Ignore
    }

    team = team || teams.filterBy('isSlack').get('firstObject');
    return this.replaceWith('team', team.get('domain'));
  }
});
