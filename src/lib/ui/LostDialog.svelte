<script lang="ts">
    import Dialog from './Dialog.svelte';

    type Props = {
        closeDialog: () => void;
        onsubmit?: (result: { closedOn: string; reason: string }) => void;
    };
    const { closeDialog, onsubmit }: Props = $props();

    // Local date as 'YYYY-MM-DD'.
    let closedOn = $state<string>(new Date().toLocaleDateString('sv-SE'));
    let reason = $state<string>('');

    const submit = () => {
        onsubmit?.({ closedOn, reason });
        closeDialog();
    };
</script>

<Dialog {closeDialog} width={480}>
    <header>
        <h2>Lost</h2>
    </header>
    <main>
        <div>
            <label for="lost-date">Lost date</label>
            <input id="lost-date" type="date" bind:value={closedOn} />
        </div>
        <div>
            <label for="lost-reason">Reason</label>
            <textarea id="lost-reason" bind:value={reason}></textarea>
        </div>
    </main>
    <footer>
        <button class="cancel" onclick={closeDialog}>Cancel</button>
        <button class="ok" onclick={submit}>OK</button>
    </footer>
</Dialog>

<style lang="scss">
    header {
        padding: 12px 24px;
        border-bottom: 1px solid #ddd;
        & h2 {
            margin: 0;
            font-size: 16px;
            font-weight: 500;
        }
    }
    main {
        padding: 12px 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    label {
        display: block;
        margin-bottom: 4px;
        font-size: 14px;
        font-weight: 600;
        color: #555;
    }
    input, textarea {
        width: 100%;
        padding: 4px 8px;
        font-size: 15px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    textarea {
        min-height: 120px;
        padding: 8px;
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
