const STORAGE_KEY = 'tasks'

export default {
  name: 'App',
  setup() {
    const tasks = ref([])
    const newTaskText = ref('')
    const currentFilter = ref('all')
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

    return {
      tasks, newTaskText, currentFilter, filters,
      completedCount, activeCount, filteredTasks, emptyMessage,
      addTask, toggleTask, deleteTask, clearCompleted,
    }
  },
}
