const FILTERS = [
  {
    title: 'Active',
    value: 'active'
  },
  {
    title: 'Defective',
    value: 'defective'
  }
];

export default function createFilterControl (ymaps) {
  const filterItems = FILTERS
    .map(obj =>
      new ymaps.control.ListBoxItem({
        data: {
          content: obj.title,
          value: obj.value
        },
        state: { selected: true }
      })
    );

  const listBoxControl = new ymaps.control.ListBox({
    data: {content: 'Filter by state', title: 'Filter by state'},
    items: filterItems,
    state: {
      filters: filterItems.reduce(function (filters, item) {
        filters[item.data.get('value')] = item.isSelected();
        return filters;
      }, {})
    }
  });

  listBoxControl.events.add(['select', 'deselect'], event => {
    var item = event.get('target');
    var filters = ymaps.util.extend({}, listBoxControl.state.get('filters'));
    filters[item.data.get('value')] = item.isSelected();
    listBoxControl.state.set('filters', filters);
  });

  return listBoxControl;
}
