<script lang="ts">
    import ProjectDialog from './ProjectDialog.svelte';
    import CustomerDialog from './CustomerDialog.svelte';
    import TaskDialog, { type TaskItem } from './TaskDialog.svelte';
    import WonDialog from './WonDialog.svelte';
    import LostDialog from './LostDialog.svelte';
    import DeleteConfirmDialog from './DeleteConfirmDialog.svelte';
    import RowMenu from './RowMenu.svelte';
    import { onMount } from 'svelte';
    import { ChevronDown, ChevronUp, ChevronsUpDown, TriangleAlert } from '@lucide/svelte';
    import { m } from '../paraglide/messages.js';
    import { OPEN_STATUSES, statusLabel, type ProjectStatus } from '../status';
    import { dueLevel } from '../due';
    import { projectLabel, type ProjectRow as Row, type Sort, type SortKey } from '../project';

    type Props = {
        data: Row[];
        tasks?: TaskItem[];
        sort?: Sort;
        onsort?: (key: SortKey) => void;
        onstatus?: (row: Row, status: ProjectStatus) => void;
        onnote?: (row: Row, note: string) => void;
        onproject?: (row: Row, value: { name: string; detail: string }) => void;
        oncustomer?: (row: Row, value: { customer: string; detail: string }) => void;
        onwon?: (row: Row, value: { closedOn: string; amount: number; note: string }) => void;
        onlost?: (row: Row, value: { closedOn: string; reason: string }) => void;
        onreopen?: (row: Row) => void;
        ondelete?: (row: Row) => void;
        ontasktoggle?: (task: TaskItem) => void;
        ontaskadd?: (projectId: string, input: { title: string; dueDate: string }) => void;
        ontaskdelete?: (task: TaskItem) => void;
    };
    const {
        data, tasks = [], sort = null, onsort, onstatus, onnote, onproject, oncustomer, onwon, onlost, onreopen, ondelete,
        ontasktoggle, ontaskadd, ontaskdelete
    }: Props = $props();

    type DialogKind = 'project' | 'customer' | 'task' | 'won' | 'lost' | 'delete';
    let dialog = $state.raw<{ kind: DialogKind; row: Row } | null>(null);
    const closeDialog = () => dialog = null;
    const openTaskCount = (row: Row) =>
        tasks.filter((t) => t.projectId === row.id && !t.doneAt).length;
    // The viewer's local date. It is known only in the browser, so the warning appears after the
    // page loads instead of being rendered with the server's date.
    let today = $state<string | null>(null);
    onMount(() => {
        today = new Date().toLocaleDateString('sv-SE');
    });
    const dueOf = (row: Row) =>
        today === null ? null : dueLevel(
            tasks.filter((t) => t.projectId === row.id && !t.doneAt).map((t) => t.dueDate), today);
    const isOpen = (status: ProjectStatus) => (OPEN_STATUSES as readonly string[]).includes(status);
    const ariaSort = (key: SortKey) =>
        sort?.key !== key ? 'none' : sort.dir === 'asc' ? 'ascending' : 'descending';
</script>

<!-- A name that is not set is shown dimmed, still clickable so it can be filled in. -->
{#snippet shown(value: string)}
    {#if value}
        {value}
    {:else}
        <span class="not-set">{m.not_set()}</span>
    {/if}
{/snippet}

{#snippet sortButton(key: SortKey, label: string)}
    <button onclick={() => onsort?.(key)}>
        {label}
        {#if sort?.key !== key}
            <ChevronsUpDown size={16} />
        {:else if sort.dir === 'asc'}
            <ChevronUp size={16} />
        {:else}
            <ChevronDown size={16} />
        {/if}
    </button>
{/snippet}

<table>
    <thead>
        <tr>
            <th class="project-name" aria-sort={ariaSort('project')}>{@render sortButton('project', m.project_name())}</th>
            <th class="customer" aria-sort={ariaSort('customer')}>{@render sortButton('customer', m.customer())}</th>
            <th class="fit" aria-sort={ariaSort('status')}>{@render sortButton('status', m.status())}</th>
            <th class="task"><span class="plain">{m.task()}</span></th>
            <th class="fit">{m.note()}</th>
            <th class="fit"></th>
        </tr>
    </thead>
    <tbody>
        {#each data as d (d.id)}
            {@const due = dueOf(d)}
            <tr class={due} data-due={due}>
                <td><button class="text-link" onclick={() => dialog = { kind: 'project', row: d }}>{@render shown(d.name)}</button></td>
                <td><button class="text-link" onclick={() => dialog = { kind: 'customer', row: d }}>{@render shown(d.customer)}</button></td>
                <td class="fit">
                    {#if isOpen(d.status)}
                        <select value={d.status}
                            onchange={(e) => onstatus?.(d, e.currentTarget.value as ProjectStatus)}>
                            {#each OPEN_STATUSES as st (st)}
                                <option value={st}>{statusLabel(st)}</option>
                            {/each}
                        </select>
                    {:else}
                        <span class="closed">{statusLabel(d.status)}</span>
                    {/if}
                </td>
                <td class="number task">
                    <div class="tasks">
                        {#if due}
                            <span class="due {due}" title={due === 'overdue' ? m.task_overdue() : m.task_due_soon()}>
                                <TriangleAlert size={16} />
                            </span>
                        {/if}
                        <button class="text-link" onclick={() => dialog = { kind: 'task', row: d }}>{openTaskCount(d)}</button>
                    </div>
                </td>
                <td class="fit">
                    <input type="text" class="note" value={d.note}
                        onchange={(e) => onnote?.(d, e.currentTarget.value)} />
                </td>
                <td class="fit">
                    <RowMenu
                        closed={!isOpen(d.status)}
                        onreopen={() => onreopen?.(d)}
                        onwon={() => dialog = { kind: 'won', row: d }}
                        onlost={() => dialog = { kind: 'lost', row: d }}
                        ondelete={() => dialog = { kind: 'delete', row: d }}
                    />
                </td>
            </tr>
        {/each}
    </tbody>
</table>

{#if dialog?.kind === 'project'}
    <ProjectDialog {closeDialog} name={dialog.row.name} detail={dialog.row.projectDetail}
        onsubmit={(value) => onproject?.(dialog!.row, value)} />
{:else if dialog?.kind === 'customer'}
    <CustomerDialog {closeDialog} customer={dialog.row.customer} detail={dialog.row.customerDetail}
        onsubmit={(value) => oncustomer?.(dialog!.row, value)} />
{:else if dialog?.kind === 'task'}
    <TaskDialog {closeDialog} title={m.tasks_title({ name: projectLabel(dialog.row) })}
        tasks={tasks.filter((t) => t.projectId === dialog!.row.id)}
        ontoggle={ontasktoggle}
        ondelete={ontaskdelete}
        onadd={(input) => ontaskadd?.(dialog!.row.id, input)} />
{:else if dialog?.kind === 'won'}
    <WonDialog {closeDialog} onsubmit={(value) => onwon?.(dialog!.row, value)} />
{:else if dialog?.kind === 'lost'}
    <LostDialog {closeDialog} onsubmit={(value) => onlost?.(dialog!.row, value)} />
{:else if dialog?.kind === 'delete'}
    <DeleteConfirmDialog {closeDialog} projectName={projectLabel(dialog.row)}
        onconfirm={() => ondelete?.(dialog!.row)} />
{/if}

<style lang="scss">
    table {
        width: 100%;
        border-collapse: collapse;
        & th {
            background-color: #f2f3f3;
            border-bottom: 2px solid #e2e2e2;
            text-align: left;
            padding: 8px 12px;
            font-size: 14px;
            color: #080808;
            &:first-of-type {
                border-radius: 6px 0 0 0;
            }
            &:last-of-type {
                border-radius: 0 6px 0 0;
            }
            &.project-name, &.customer {
                min-width: 250px;
                width: 50%;
            }
            /* Fits the content (the input), so the project and customer columns take the rest. */
            &.fit {
                width: 1%;
                white-space: nowrap;
            }
            &.task {
                width: 84px;
                min-width: 84px;
            }
            & button {
                display: flex;
                gap: 4px;
                align-items: center;
                background: transparent;
                padding: 4px;
                font-size: 14px;
                font-weight: 500;
                border: 0;
                cursor: pointer;
            }
            & .plain {
                display: block;
                padding: 4px;
                font-weight: 500;
            }
        }
        & td {
            border-bottom: 1px solid #e2e2e2;
            padding: 12px 12px;
            font-size: 14px;
            font-weight: 600;
            color: #313131;
            background-color: #fff;
            &.number {
                text-align: right;
            }
            &.task {
                width: 84px;
                min-width: 84px;
            }
        }
    }
    button.text-link {
        display: inline-block;
        background-color: transparent;
        font-size: 14px;
        font-weight: 600;
        border: 0;
        border-bottom: 2px solid #999;
        padding: 0 2px 2px 2px;
        cursor: pointer;
        &:has(span.not-set) {
            border-color: #ccc;
        }
    }
    /* A row is tinted when a task is due today or late. The cells carry their own background. */
    tr.today td {
        background-color: #fffcea;
    }
    tr.overdue td {
        background-color: #fff7f4;
    }
    /* The warning icon sits at the left and the count at the right, with or without the icon. */
    div.tasks {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 12px;
    }
    span.due {
        display: flex;
        &.overdue {
            color: #d33;
        }
        &.today, &.soon {
            color: #d98200;
        }
    }
    span.not-set {
        font-weight: 500;
        color: #aaa;
    }
    span.closed {
        font-size: 14px;
        font-weight: 600;
        color: #666;
    }
    select {
        padding: 4px;
        border: 1px solid #bbb;
        border-radius: 6px;
        font-weight: 600;
    }
    input {
        width: 100%;
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid #bbb;
    }
    input.note {
        width: 240px;
    }
</style>
