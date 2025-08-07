<template>
  <div id="ganttContainer" ref="ganttContainer"></div>
</template>

<script>
// import {Gantt} from "dhtmlx-gantt";
// import "dhtmlx-gantt/codebase/dhtmlxgantt.css"
import { Gantt } from "@dhx/trial-gantt";

export default {
  props: {
    tasks: {
      type: Object,
      default () {
        return {data: [], links: []}
      }
    }
  },

  mounted() {
    let gantt = Gantt.getGanttInstance();
    gantt.plugins({
      // quick_info: true,
      tooltip: true,
      // drag_timeline: true
    });
    gantt.i18n.setLocale('cn')
    gantt.init(this.$refs.ganttContainer);
    gantt.parse(this.$props.tasks);
    // var firstTaskDate = gantt.getTaskByIndex(0).start_date;
    var dateToStr = gantt.date.date_to_str(gantt.config.task_date);
    var today = new Date('2023, 04, 03')
    gantt.addMarker({
      start_date: today,
      css: "today",
      text: "Today",
      title: "Today: " + dateToStr(today)
    });

    gantt.attachEvent('onTaskSelected', (id) => {
      let task = gantt.getTask(id);
      this.$emit('task-selected', task);
    });

    gantt.attachEvent('onTaskIdChange', (id, new_id) => {
      if (gantt.getSelectedId() == new_id) {
        let task = gantt.getTask(new_id);
        this.$emit('task-selected', task);
      }
    });

    gantt.createDataProcessor((entity, action, data, id) => { 
      this.$emit(`${entity}-updated`, id, action, data);
    });
    
  },
  beforeUnmount() {
    // 清理 Gantt 资源
    // if (gantt && gantt.destroy) {
    //   gantt.destroy();
    // }
  },

  unmounted() {
    this.gantt.destructor();
  },
}
</script>

<style>
  @import "@dhx/trial-gantt/codebase/dhtmlxgantt.css";
  .gantt_layout_cell {
    background-image: url('../assets/images/1.png');
    background-size: cover;      /* 覆盖整个区域 */
    background-position: center; /* 居中显示 */
    background-repeat: no-repeat;
    background-attachment: fixed;
  }
  .gantt_grid_scale,
  .gantt_grid_data {
    user-select: none !important;
  }
  .gantt_grid_head_cell {
    cursor: default !important;
  }
  .gantt_task_scale, .gantt_grid, .gantt_grid_head_cell, .gantt_task_row, .gantt_grid_scale {
    background-color: rgba(0, 0 ,0, .35) !important;
    color: #fff !important;
  }
  .gantt_tree_content, .gantt_scale_cell {
    color: #fff !important;
  }
  .gantt_grid_data .gantt_row.gantt_selected, .gantt_grid_data .gantt_row.odd.gantt_selected,
  .gantt_task_row.odd.gantt_selected, .gantt_task_row.gantt_selected {
    background-color: #4a4b53 !important;
  }
  /* 修改数据行背景色 */
  .gantt_grid_data .gantt_row, .gantt_data_area, .gantt_task_row {
    background-color: rgba(0, 0 ,0, .35) !important;
  }
  .gantt_add:before, .gantt_grid_head_add:before {
    color: #fff !important;
  }
  /* 任务条整体（未完成部分） */
  .gantt_task_line {
    background-color: red;
  }
  /* 任务进度条（已完成部分） */
  .gantt_task_progress {
    background-color: rgba(0, 0 ,0, .35) !important;
  }
</style>