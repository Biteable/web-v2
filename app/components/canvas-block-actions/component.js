import Ember from 'ember';

const { computed } = Ember;

export default Ember.Component.extend({
  localClassNames: ['canvas-block-actions'],

  clipboardText: computed('canvas.id', 'block.id', function() {
    const { protocol, hostname } = window.location;
    const port = window.location.port ?  `:${window.location.port}` : '';

    const canvasId = this.get('canvas.id');
    const blockId = this.get('block.id');

    return `${protocol}//${hostname}${port}/${canvasId}#${blockId}`;
  })
});
