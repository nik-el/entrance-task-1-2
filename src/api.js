import { mapServerData } from './mappers';

export function loadList() {
  return fetch(`/api/stations`)
    .then(response => response.json())
    .then(mapServerData)
    //  обработка ошибки
    .catch(error => {
      alert(error);
    });
}

export function loadDetails(id) {
  return fetch(`/api/stations/${id}`)
      .then(response => response.json())
      // обработка ошибки
      .catch(error => {
          alert(error);
      });
}
