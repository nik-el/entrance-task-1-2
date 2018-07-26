import { loadList, loadDetails } from './api';
import { getDetailsContentLayout } from './details';
import { createFilterControl } from './filter';

// модуль экспортирует одно значение, можно использовать export default
export default function initMap(ymaps, containerId) {
  const myMap = new ymaps.Map(containerId, {
    center: [55.76, 37.64],
    // controls: [],
    zoom: 10
  });

  const objectManager = new ymaps.ObjectManager({
    clusterize: true,
    gridSize: 64,
    clusterIconLayout: 'default#pieChart',
    clusterDisableClickZoom: false,
    geoObjectOpenBalloonOnClick: false,
    geoObjectHideIconOnBalloonOpen: false,
    geoObjectBalloonContentLayout: getDetailsContentLayout(ymaps)
  });

  objectManager.clusters.options.set('preset', 'islands#blueClusterIcons');

  // ищем кластеры с нективными станциями и подкрашиваем красным
  objectManager.clusters.events.add('add', (event) => {
    const cluster = objectManager.clusters.getById(event.get('objectId'));
    const objects = cluster.properties.geoObjects;
    for (const it of objects) {
      if (!it.isActive) {
        objectManager.clusters.setClusterOptions(cluster.id, {
          preset: 'islands#redClusterIcons'
        });
        break;
      }
    }
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
    console.log('objectId:', objectId);
    const obj = objectManager.objects.getById(objectId);
    console.log('obj: ', obj);

    objectManager.objects.balloon.open(objectId);

    if (!obj.properties.details) {
      loadDetails(objectId).then(data => {
        obj.properties.details = data;
        objectManager.objects.balloon.setData(obj);
      });
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
