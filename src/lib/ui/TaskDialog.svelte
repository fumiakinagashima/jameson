<script lang="ts" module>
    export type TaskItem = {
        id: string;
        project: string;
        title: string;
        // 'YYYY-MM-DD'. Null means no due date.
        dueDate: string | null;
        // 'YYYY-MM-DD'. Null means still open.
        doneAt: string | null;
    };
</script>

<script lang="ts">
    import Dialog from './Dialog.svelte';
    import { Trash } from '@lucide/svelte';

    type Props = {
        closeDialog: () => void;
        title: string;
        tasks: TaskItem[];
        // Show the project name on each row (for the cross-project "My Tasks" view).
        showProject?: boolean;
        ontoggle?: (task: TaskItem) => void;
        // The add form is shown only when this is given.
        onadd?: (input: { title: string; dueDate: string }) => void;
        // The trash button on each row is shown only when this is given.
        ondelete?: (task: TaskItem) => void;
    };
    const { closeDialog, title, tasks, showProject = false, ontoggle, onadd, ondelete }: Props = $props();

    // Local date as 'YYYY-MM-DD'.
    const today = () => new Date().toLocaleDateString('sv-SE');

    let newTitle = $state<string>('');
    let newDueDate = $state<string>(today());
    const canAdd = $derived(!!newTitle.trim() && !!newDueDate);

    const add = (e: SubmitEvent) => {
        e.preventDefault();
        if (!canAdd) return;
        onadd?.({ title: newTitle.trim(), dueDate: newDueDate });
        newTitle = '';
        newDueDate = today();
    };

    const upcoming = $derived(
        tasks
            .filter((t) => !t.doneAt)
            .sort((a, b) => (a.dueDate ?? '9999-12-31').localeCompare(b.dueDate ?? '9999-12-31'))
    );
    const done = $derived(
        tasks.filter((t) => t.doneAt).sort((a, b) => b.doneAt!.localeCompare(a.doneAt!))
    );
</script>

{#snippet rows(list: TaskItem[], dateOf: (t: TaskItem) => string | null, empty: string)}
    {#if list.length === 0}
        <p class="empty">{empty}</p>
    {:else}
        <ul>
            {#each list as t (t.id)}
                <li>
                    <input type="checkbox" checked={!!t.doneAt} disabled={!ontoggle}
                        onchange={() => ontoggle?.(t)} />
                    <span class="title">{t.title}</span>
                    {#if showProject}<span class="project">{t.project}</span>{/if}
                    <span class="date">{dateOf(t) ?? '-'}</span>
                    {#if ondelete}
                        <button class="trash" title="Delete task" onclick={() => ondelete(t)}>
                            <Trash size={16} />
                        </button>
                    {/if}
                </li>
            {/each}
        </ul>
    {/if}
{/snippet}

<Dialog {closeDialog} width={720}>
    <header>
        <h2>{title}</h2>
    </header>
    <main>
        {#if onadd}
            <form onsubmit={add}>
                <input type="text" class="new-title" placeholder="Add a task" bind:value={newTitle} />
                <input type="date" required bind:value={newDueDate} />
                <button type="submit" class="add" disabled={!canAdd}>Add</button>
            </form>
        {/if}
        <section>
            <p>Upcoming</p>
            {@render rows(upcoming, (t) => t.dueDate, 'No upcoming tasks.')}
        </section>
        <section>
            <p>Done</p>
            {@render rows(done, (t) => t.doneAt, 'No completed tasks yet.')}
        </section>
    </main>
    <footer>
        <button class="close" onclick={closeDialog}>Close</button>
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
        padding: 20px 24px;
    }
    form {
        display: flex;
        gap: 8px;
        margin-bottom: 24px;
        & input {
            padding: 4px 8px;
            font-size: 14px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        & .new-title {
            flex: 1;
        }
    }
    section + section {
        margin-top: 24px;
    }
    p {
        margin: 0 0 4px;
        font-size: 14px;
        font-weight: 600;
        color: #555;
        &.empty {
            font-weight: 400;
            color: #888;
        }
    }
    ul {
        margin: 0;
        padding: 0;
        list-style: none;
        background-color: #fff;
        border: 1px solid #e2e2e2;
        border-radius: 6px;
    }
    li {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        font-size: 14px;
        color: #313131;
        & + li {
            border-top: 1px solid #e2e2e2;
        }
        & .title {
            flex: 1;
        }
        & .project {
            color: #666;
        }
        & .date {
            min-width: 84px;
            text-align: right;
            color: #666;
        }
    }
    footer {
        padding: 8px 24px 16px;
        display: flex;
        justify-content: flex-end;
    }
    button {
        border: 0;
        border-radius: 4px;
        padding: 4px 12px;
        font-weight: 500;
        cursor: pointer;
        &.close {
            background-color: #ddd;
            color: #444;
        }
        &.add {
            background-color: #4090ea;
            color: #fff;
            &:disabled {
                opacity: 0.5;
                cursor: default;
            }
        }
        &:hover {
            opacity: 0.85;
        }
    }
    button.trash {
        width: 24px;
        height: 24px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        color: #888;
        &:hover {
            color: #d33;
        }
    }
</style>
