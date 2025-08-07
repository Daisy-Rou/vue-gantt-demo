<template>
  <div class="container" ref="containerRef">
    <div v-if="false" class="right-container">
      <div class="gantt-selected-info">
        <div v-if="selectedTask">
          <h2>{{ selectedTask.text }}</h2>
          <span><b>ID: </b>{{ selectedTask.id }}</span
          ><br />
          <span><b>Progress: </b> {{ progressPercentage }}</span
          ><br />
          <span><b>Start Date: </b
            >{{ formattedStartDate }}</span
          ><br />
          <span><b>End Date: </b>{{ formattedEndDate }}</span
          ><br />
        </div>
        <div v-else class="select-task-prompt">
          <h2>Click any task</h2>
        </div>
      </div>
      <ul class="gantt-messages">
        <li
          class="gantt-message"
          v-for="(message, index) in messages"
          v-bind:key="index"
        >
          {{ message }}
        </li>
      </ul>
    </div>
    <GanttComponent
      class="left-container"
      :style="{ width: leftWidth + '%' }"
      :tasks="tasks"
      @task-updated="logTaskUpdate"
      @link-updated="logLinkUpdate"
      @task-selected="selectTask"
    ></GanttComponent>
    <div class="resize-handle" @mousedown="startDrag"></div>
    <iframe 
      class="background-iframe"
      :style="{ width: (100 - leftWidth) + '%' }"
      :src="backgroundUrl"
      frameborder="0"
      allowfullscreen
    ></iframe>
  </div>
</template>

<script>
import GanttComponent from "./components/GanttComponent.vue";

export default {
  name: "app",
  components: { GanttComponent },
  data() {
    return {
      leftWidth: 50,
      backgroundUrl: 'http://47.111.147.202:10090/video.html',
      tasks: {
        data: [
          { id: 11, text: "Project #1", type: "project", progress: 0.6, open: true },

          { id: 12, text: "Task #1", start_date: "03-04-2023", duration: 5, parent: 11, progress: 1, open: true },
          { id: 13, text: "Task #2", start_date: "03-04-2023", type: "project", parent: 11, progress: 0.5, open: true },
          { id: 14, text: "Task #3", start_date: "02-04-2023", duration: 6, parent: 11, progress: 0.8, open: true },
          { id: 15, text: "Task #4", type: "project", parent: 11, progress: 0.2, open: true },
          { id: 16, text: "Final milestone", start_date: "15-04-2023", type: "milestone", parent: 11, progress: 0, open: true },

          { id: 17, text: "Task #2.1", start_date: "03-04-2023", duration: 2, parent: 13, progress: 1, open: true },
          { id: 18, text: "Task #2.2", start_date: "06-04-2023", duration: 3, parent: 13, progress: 0.8, open: true },
          { id: 19, text: "Task #2.3", start_date: "10-04-2023", duration: 4, parent: 13, progress: 0.2, open: true },
          { id: 20, text: "Task #2.4", start_date: "10-04-2023", duration: 4, parent: 13, progress: 0, open: true },
          { id: 21, text: "Task #4.1", start_date: "03-04-2023", duration: 4, parent: 15, progress: 0.5, open: true },
          { id: 22, text: "Task #4.2", start_date: "03-04-2023", duration: 4, parent: 15, progress: 0.1, open: true },
          { id: 23, text: "Mediate milestone", start_date: "14-04-2023", type: "milestone", parent: 15, progress: 0, open: true }
        ],
        links: [
          { id: 10, source: 11, target: 12, type: 1 },
          { id: 11, source: 11, target: 13, type: 1 },
          { id: 12, source: 11, target: 14, type: 1 },
          { id: 13, source: 11, target: 15, type: 1 },
          { id: 14, source: 23, target: 16, type: 0 },
          { id: 15, source: 13, target: 17, type: 1 },
          { id: 16, source: 17, target: 18, type: 0 },
          { id: 17, source: 18, target: 19, type: 0 },
          { id: 18, source: 19, target: 20, type: 0 },
          { id: 19, source: 15, target: 21, type: 2 },
          { id: 20, source: 15, target: 22, type: 2 },
          { id: 21, source: 15, target: 23, type: 0 }
        ]
      },
      selectedTask: null,
      messages: [],
    };
  },
  computed: {
    progressPercentage() {
      let taskProgress = this.selectedTask.progress;
      if (!taskProgress) {
        return "0";
      }
      return `${Math.round(+taskProgress * 100)} %`;
    },
    formattedStartDate() {
      let taskStart = this.selectedTask.start_date;
      return `${taskStart.getFullYear()} / ${taskStart.getMonth() + 1} / ${taskStart.getDate()}`;
    },
    formattedEndDate() {
      let taskEnd = this.selectedTask.end_date;
      return `${taskEnd.getFullYear()} / ${taskEnd.getMonth() + 1} / ${taskEnd.getDate()}`;
    },
  },
  methods: {
    startDrag(e) {
      this.isDragging = true;
      this.startX = e.clientX;
      this.startWidth = this.leftWidth;
      
      document.addEventListener('mousemove', this.drag);
      document.addEventListener('mouseup', this.stopDrag);
      
      // 防止文本选中
      e.preventDefault();
    },
    drag(e) {
      if (!this.isDragging) return;
      
      const container = this.$refs.containerRef;
      const containerWidth = container.clientWidth;
      const deltaX = e.clientX - this.startX;
      const deltaPercent = (deltaX / containerWidth) * 100;
      
      // 计算新的左侧宽度，限制在10%-90%之间
      let newWidth = this.startWidth + deltaPercent;
      if (newWidth < 10) newWidth = 10;
      if (newWidth > 90) newWidth = 90;
      
      this.leftWidth = newWidth;
    },
    stopDrag() {
      if (this.isDragging) {
        this.isDragging = false;
        this.dragCount++;
      }
      
      document.removeEventListener('mousemove', this.drag);
      document.removeEventListener('mouseup', this.stopDrag);
    },
    selectTask(task) {
      this.selectedTask = task;
    },

    addMessage(message) {
      this.messages.unshift(message);
      if (this.messages.length > 40) {
        this.messages.pop();
      }
    },

    logTaskUpdate(id, mode, task) {
      let text = task && task.text ? ` (${task.text})` : "";
      let message = `Task ${mode}: ${id} ${text}`;
      this.addMessage(message);
    },

    logLinkUpdate(id, mode, link) {
      let message = `Link ${mode}: ${id}`;
      if (link) {
        message += ` ( source: ${link.source}, target: ${link.target} )`;
      }
      this.addMessage(message);
    },
  },
};
</script>

<style>
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

.container {
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100%;
  transition: all 0.3s ease;
}

.left-container {
  /* width: 50%; */
  overflow: hidden;
  position: relative;
  height: 100%;
}
.background-iframe {
  /* width: 50%; */
  height: 100%;
}
.resize-handle {
  width: 8px;
  background: #3498db;
  cursor: col-resize;
  position: relative;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resize-handle:hover {
  background: #2980b9;
}

.resize-handle:active {
  background: #1c6ea4;
}

.resize-handle::before {
  content: "";
  position: absolute;
  width: 2px;
  height: 40px;
  background: white;
  border-radius: 1px;
}

.right-container {
  border-right: 1px solid #cecece;
  float: right;
  height: 100%;
  width: 340px;
  box-shadow: 0 0 5px 2px #aaa;
  position: relative;
  z-index: 2;
}

.gantt-messages {
  list-style-type: none;
  height: 50%;
  margin: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding-left: 5px;
}

.gantt-messages > .gantt-message {
  background-color: #f4f4f4;
  box-shadow: inset 5px 0 #d69000;
  font-family: Geneva, Arial, Helvetica, sans-serif;
  font-size: 14px;
  margin: 5px 0;
  padding: 8px 0 8px 10px;
}

.gantt-selected-info {
  border-bottom: 1px solid #cecece;
  box-sizing: border-box;
  font-family: Geneva, Arial, Helvetica, sans-serif;
  height: 50%;
  line-height: 28px;
  padding: 10px;
}

.gantt-selected-info h2 {
  border-bottom: 1px solid #cecece;
}

.select-task-prompt h2 {
  color: #d9d9d9;
}
</style>
