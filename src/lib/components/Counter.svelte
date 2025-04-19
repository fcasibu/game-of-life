<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLButtonElement> {
    defaultCount?: number;
  }

  let { defaultCount = 0, ...rest }: Props = $props();
  let count = $state(defaultCount);

  const increment = () => {
    count += 1;
  };
</script>

<button {...rest} type="button" onclick={increment}>
  Click me {count}
</button>
