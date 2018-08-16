import { loadList, loadDetails } from './api';
import getDetailsContentLayout from './details';
import createFilterControl from './filter';

// модуль экспортирует одно значение, можно использовать export default
export default function initMap(ymaps, containerId) {
  const myMap = new ymaps.Map(containerId, {
    center: [55.76, 37.64],
    controls: ['default'],
    zoom: 10
  });

  // будем считать,что показ пробок здесь не нужен
  myMap.controls.remove('trafficControl');

  const objectManager = new ymaps.ObjectManager({
    clusterize: true,
    gridSize: 64,
    clusterIconLayout: 'default#pieChart',
    clusterDisableClickZoom: false,
    geoObjectOpenBalloonOnClick: false,
    geoObjectHideIconOnBalloonOpen: false,
    geoObjectBalloonContentLayout: getDetailsContentLayout(ymaps),
    geoObjectBalloonPanelMaxMapArea: 0
  });

  loadList().then(data => {
    objectManager.add(data);
    // согласно API, для отображения точек необходимо добавить коллекцию на карту через geoObjects.add
    myMap.geoObjects.add(objectManager);
    // для удобства корректируем центр и масштаб карты
    myMap.setBounds(objectManager.getBounds());
  });

  // details
  objectManager.objects.events.add('click', event => {
    const objectId = event.get('objectId');
    const obj = objectManager.objects.getById(objectId);

    // открываем балун, только если есть информация по нему (в объекте или по api),
    // иначе выкидываем ошибку через alert
    if (!obj.properties.details) {
      loadDetails(objectId).then(data => {
        if (data) {
          objectManager.objects.balloon.open(objectId);

          obj.properties.details = data;
          objectManager.objects.balloon.setData(obj);
        }
      });
    } else {
      objectManager.objects.balloon.open(objectId);
    }
  });

  // filters
  const listBoxControl = createFilterControl(ymaps);
  myMap.controls.add(listBoxControl);

  const filterMonitor = new ymaps.Monitor(listBoxControl.state);
  filterMonitor.add('filters', filters => {
    objectManager.setFilter(
      obj => filters[obj.isActive ? 'active' : 'defective']
    );
  });
}
