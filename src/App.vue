<template>
  <div class="container mx-auto max-w-2xl px-4 py-8">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-slate-800 mb-2">
        📝 Мой Todo List
        <span class="text-sm font-normal text-green-600 align-middle ml-2">Vue 3</span>
      </h1>
      <p class="text-slate-600">Организуйте свои задачи</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-3 mb-6">
      <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <div class="text-2xl font-bold text-blue-600">{{ tasks.length }}</div>
        <div class="text-xs text-slate-500">Всего</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <div class="text-2xl font-bold text-green-600">{{ completedCount }}</div>
        <div class="text-xs text-slate-500">Выполнено</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-4 text-center">
        <div class="text-2xl font-bold text-orange-600">{{ activeCount }}</div>
        <div class="text-xs text-slate-500">Активных</div>
      </div>
    </div>

    <!-- Add task form -->
    <form @submit.prevent="addTask" class="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div class="flex gap-2">
        <input
          v-model.trim="newTaskText"
          type="text"
          placeholder="Введите новую задачу..."
          class="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          maxlength="200"
          required
          ref="taskInput"
        >
        <button
          type="submit"
          :disabled="!newTaskText"
          class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 disabled:active:scale-100"
        >
          Добавить
        </button>
      </div>
    </form>

    <!-- Filters -->
    <div class="flex gap-2 mb-4 justify-center">
      <button
        v-for="filter in filters"
        :key="filter.value"
        @click="currentFilter = filter.value"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition',
          currentFilter === filter.value
            ? 'bg-blue-600 text-white'
            : 'bg-white text-slate-600 hover:bg-slate-50'
        ]"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Tasks list -->
    <div class="relative">
      <TransitionGroup
        tag="div"
        name="list"
        class="space-y-2"
      >
        <div
          v-for="task in filteredTasks"
          :key="task.id"
          class="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition group"
        >
          <input
            type="checkbox"
            :checked="task.completed"
            @change="toggleTask(task.id)"
            class="w-5 h-5 text-blue-600 rounded cursor-pointer flex-shrink-0"
          >
          <span
            :class="[
              'flex-1 break-words transition-all',
              task.completed ? 'line-through text-slate-400' : 'text-slate-800'
            ]"
          >
            {{ task.text }}
          </span>
          <button
            @click="deleteTask(task.id)"
            class="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50 w-8 h-8 rounded-lg flex items-center justify-center transition flex-shrink-0"
            title="Удалить"
          >
            ✕
          </button>
        </div>
      </TransitionGroup>

      <!-- Empty state -->
      <div
        v-if="filteredTasks.length === 0"
        class="text-center py-12 text-slate-400"
      >
        <div class="text-6xl mb-3">✨</div>
        <p class="text-lg">{{ emptyMessage }}</p>
        <p class="text-sm" v-if="currentFilter === 'all'">Добавьте первую задачу выше</p>
      </div>
    </div>

    <!-- Clear completed -->
    <div v-if="completedCount > 0" class="mt-6 text-center">
      <button
        @click="clearCompleted"
        class="text-sm text-red-600 hover:text-red-700 hover:underline transition"
      >
        Очистить выполненные
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'

const STORAGE_KEY = 'tasks'

const tasks = ref([])
const newTaskText = ref('')
const currentFilter = ref('all')
const taskInput = ref(null)
let nextId = 1

const filters = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'completed', label: 'Выполненные' },
]

onMounted(() => {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  tasks.value = stored
  if (stored.length > 0) {
    nextId = Math.max(...stored.map(t => t.id)) + 1
  }
})

watch(tasks, (v) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(v))
}, { deep: true })

const completedCount = computed(() =>
  tasks.value.filter(t => t.completed).length
)
const activeCount = computed(() => tasks.value.length - completedCount.value)

const filteredTasks = computed(() => {
  switch (currentFilter.value) {
    case 'active': return tasks.value.filter(t => !t.completed)
    case 'completed': return tasks.value.filter(t => t.completed)
    default: return tasks.value
  }
})

const emptyMessage = computed(() => {
  switch (currentFilter.value) {
    case 'completed': return 'Нет выполненных задач'
    case 'active': return 'Нет активных задач'
    default: return 'Список задач пуст'
  }
})

function addTask() {
  const text = newTaskText.value.trim()
  if (!text) return
  tasks.value.unshift({
    id: nextId++,
    text,
    completed: false,
    createdAt: new Date().toISOString(),
  })
  newTaskText.value = ''
  nextTick(() => taskInput.value?.focus())
}

function toggleTask(id) {
  const t = tasks.value.find(x => x.id === id)
  if (t) t.completed = !t.completed
}

function deleteTask(id) {
  tasks.value = tasks.value.filter(t => t.id !== id)
}

function clearCompleted() {
  tasks.value = tasks.value.filter(t => !t.completed)
}
</script>
