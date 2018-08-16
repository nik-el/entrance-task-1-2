import createChart from './chart';

export default function getDetailsContentLayout (ymaps) {
  const BalloonContentLayout = ymaps.templateLayoutFactory.createClass(`
    <div class="details-info">
      {% if (properties.details) %}
      <div class="details-info">
        <div class="details-label">base station</div>
        <div class="details-title">{{properties.details.serialNumber}}</div>
        {% if (properties.details.isActive) %}
        <div class="details-state details-state_active">active</div>
        {% else %}
        <div class="details-state details-state_defective">defective</div>
        {% endif %}
        <div class="details-state details-state_connections">
          connections: {{properties.details.connections}}
        </div>
      </div>
      <div class="details-info">
        <div class="details-label">connections</div>
        <!-- фикс обрезки тултипа -->
        <canvas class="details-chart" width="300" height="100" />
      </div>
        {% else %}
      <div class="details-info">
        Идет загрузка данных...
      </div>
        {% endif %}
    </div>
  `,
  {
    // при использовании стрелочной функции теряется контекст
    build: function () {
      BalloonContentLayout.superclass.build.call(this);

      const { details } = this.getData().object.properties;

      if (details) {
        const container = this.getElement().querySelector('.details-chart');

        this.connectionChart = createChart(
          container,
          details.chart,
          details.isActive
        );
      }
    },
    // при использовании стрелочной функции теряется контекст
    clear: function () {
      if (this.connectionChart) {
        this.connectionChart.destroy();
      }

      BalloonContentLayout.superclass.clear.call(this);
    }
  });

  return BalloonContentLayout;
}
