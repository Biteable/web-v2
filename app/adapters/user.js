import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  urlForFindRecord(id, modelName, snapshot) {
    const teamID = snapshot.adapterOptions.team.get('id');
    return `${this.get('namespace')}/teams/${teamID}/user`;
  }
});
