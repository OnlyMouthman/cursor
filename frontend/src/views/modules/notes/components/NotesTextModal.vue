<template>
  <Teleport to="body">
    <div
      class="notes-text-modal-overlay fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      @click.self="$emit('cancel')"
      @keydown.escape.prevent="$emit('cancel')"
    >
      <div
        class="w-full max-w-md rounded-lg border border-line bg-card p-4 shadow-lg"
        @click.stop
      >
        <h2 :id="titleId" class="text-sm font-semibold text-ink-strong">
          {{ heading }}
        </h2>
        <input
          ref="inputRef"
          v-model="localValue"
          type="text"
          class="mt-3 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink-main outline-none ring-focus focus:ring-2"
          :placeholder="placeholder"
          maxlength="255"
          @keydown.enter.prevent="onConfirm"
        />
        <div class="mt-4 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-md border border-line px-3 py-1.5 text-sm text-ink-main hover:bg-soft"
            @click="$emit('cancel')"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            type="button"
            class="btn-primary py-1.5 text-sm"
            :disabled="!localValue.trim()"
            @click="onConfirm"
          >
            {{ $t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  heading: string
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  confirm: [value: string]
  cancel: []
}>()

const titleId = `notes-modal-title-${Math.random().toString(36).slice(2, 9)}`
const localValue = ref(props.modelValue)
const inputRef = ref<HTMLInputElement | null>(null)

watch(
  () => props.modelValue,
  v => {
    localValue.value = v
  }
)

onMounted(() => {
  nextTick(() => inputRef.value?.focus())
})

function onConfirm() {
  const v = localValue.value.trim()
  if (!v) return
  emit('confirm', v)
}
</script>
