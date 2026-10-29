<script lang="ts">
    import Dialog from './Dialog.svelte';
    import { m } from '../paraglide/messages.js';

    type Props = {
        closeDialog: () => void;
        name: string;
        detail: string;
        onsubmit?: (value: { name: string; detail: string }) => void;
    };
    const { closeDialog, name, detail, onsubmit }: Props = $props();

    // The dialog is created each time it opens, so the initial values are all that is needed.
    // svelte-ignore state_referenced_locally
    let inputName = $state<string>(name);
    // svelte-ignore state_referenced_locally
    let inputDetail = $state<string>(detail);

    const submit = () => {
        onsubmit?.({ name: inputName.trim(), detail: inputDetail });
        closeDialog();
    };
</script>

<Dialog {closeDialog}>
    <header>
        <input name="project-name" placeholder={m.input_project_name()} bind:value={inputName} />
    </header>
    <main>
        <p>{m.detail()}</p>
        <textarea bind:value={inputDetail}></textarea>
    </main>
    <footer>
        <button class="cancel" onclick={closeDialog}>{m.cancel()}</button>
        <button class="ok" onclick={submit}>{m.ok()}</button>
    </footer>
</Dialog>

<style lang="scss">
    header {
        padding: 12px 24px;
        border-bottom: 1px solid #ddd;
    }
    main {
        padding: 12px 24px;
        & > p {
            margin: 0;
            font-size: 14px;
            font-weight: 600;
            color: #555;
        }
        & textarea {
            width: 100%;
            min-height: 160px;
            margin-top: 4px;
            padding: 8px;
            font-size: 15px;
            border: 1px solid #ccc;
        }
    }
    input {
        padding: 4px 0;
        width: 100%;
        border: 0;
        background-color: transparent;
        font-size: 16px;
        font-weight: 500;
        outline: none;
    }
    footer {
        padding: 0 24px 16px;
        display: flex;
        justify-content: flex-end;
        gap: 16px;
    }
    button {
        border: 0;
        border-radius: 4px;
        padding: 4px 12px;
        font-weight: 500;
        cursor: pointer;
        &.ok {
            background-color: #4090ea;
            color: #fff;
        }
        &.cancel {
            background-color: #ddd;
            color: #444;
        }
        &:hover {
            opacity: 0.85;
        }
    }
</style>
