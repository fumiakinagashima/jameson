<script lang="ts">
    import Dialog from './Dialog.svelte';
    import { m } from '../paraglide/messages.js';

    type Props = {
        closeDialog: () => void;
        onsubmit?: (result: { closedOn: string; amount: number; note: string }) => void;
    };
    const { closeDialog, onsubmit }: Props = $props();

    // Local date as 'YYYY-MM-DD'.
    let closedOn = $state<string>(new Date().toLocaleDateString('sv-SE'));
    let amount = $state<number>(0);
    let note = $state<string>('');

    const submit = () => {
        onsubmit?.({ closedOn, amount, note });
        closeDialog();
    };
</script>

<Dialog {closeDialog} width={480}>
    <header>
        <h2>{m.mark_won()}</h2>
    </header>
    <main>
        <div>
            <label for="won-date">{m.won_date()}</label>
            <input id="won-date" type="date" bind:value={closedOn} />
        </div>
        <div>
            <label for="won-amount">{m.amount()}</label>
            <input id="won-amount" type="number" min="0" step="any" bind:value={amount} />
        </div>
        <div>
            <label for="won-note">{m.note()}</label>
            <textarea id="won-note" bind:value={note}></textarea>
        </div>
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
