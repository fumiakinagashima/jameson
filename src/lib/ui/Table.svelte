<script lang="ts">
    import ProjectDialog from './ProjectDialog.svelte';
    import CustomerDialog from './CustomerDialog.svelte';
    import TaskDialog, { type TaskItem } from './TaskDialog.svelte';
    import WonDialog from './WonDialog.svelte';
    import LostDialog from './LostDialog.svelte';
    import DeleteConfirmDialog from './DeleteConfirmDialog.svelte';
    import RowMenu from './RowMenu.svelte';
    import { ChevronsUpDown } from '@lucide/svelte';
    import { OPEN_STATUSES, STATUS_LABELS } from '../status';

    type Row = { project: string; customer: string; note: string };
    type Props = {
        data: Row[];
        tasks?: TaskItem[];
        ondelete?: (row: Row) => void;
        ontasktoggle?: (task: TaskItem) => void;
        ontaskadd?: (project: string, input: { title: string; dueDate: string }) => void;
        ontaskdelete?: (task: TaskItem) => void;
    };
    const { data, tasks = [], ondelete, ontasktoggle, ontaskadd, ontaskdelete }: Props = $props();

    type DialogKind = 'project' | 'customer' | 'task' | 'won' | 'lost' | 'delete';
    let dialog = $state.raw<{ kind: DialogKind; row: Row } | null>(null);
    const closeDialog = () => dialog = null;
    const openTaskCount = (row: Row) =>
        tasks.filter((t) => t.project === row.project && !t.doneAt).length;
</script>

<table>
    <thead>
        <tr>
            <th class="project-name">
                <button>
                    Project name <ChevronsUpDown size={16} />
                </button>
            </th>
            <th class="customer">
                <button>
                    Customer <ChevronsUpDown size={16} />
                </button>
            </th>
            <th>
                <button>
                    Status <ChevronsUpDown size={16} />
                </button>
            </th>
            <th>
                <button>
                    Task
                </button>
            </th>
            <th class="note">Note</th>
            <th></th>
        </tr>
    </thead>
    <tbody>
        {#each data as d}
            <tr>
                <td><button class="text-link" onclick={() => dialog = { kind: 'project', row: d }}>{d.project}</button></td>
                <td><button class="text-link" onclick={() => dialog = { kind: 'customer', row: d }}>{d.customer}</button></td>
                <td>
                    <select>
                        {#each OPEN_STATUSES as st (st)}
                            <option value={st}>{STATUS_LABELS[st]}</option>
                        {/each}
                    </select>
                </td>
                <td class="number">
                    <button class="text-link" onclick={() => dialog = { kind: 'task', row: d }}>{openTaskCount(d)}</button>
                </td>
                <td>
                    <input type="text" class="note" value="{d.note}" />
                </td>
                <td>
                    <RowMenu
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
    <ProjectDialog {closeDialog} />
{:else if dialog?.kind === 'customer'}
    <CustomerDialog {closeDialog} />
{:else if dialog?.kind === 'task'}
    <TaskDialog {closeDialog} title="Tasks - {dialog.row.project}"
        tasks={tasks.filter((t) => t.project === dialog!.row.project)}
        ontoggle={ontasktoggle}
        ondelete={ontaskdelete}
        onadd={(input) => ontaskadd?.(dialog!.row.project, input)} />
{:else if dialog?.kind === 'won'}
    <WonDialog {closeDialog} />
{:else if dialog?.kind === 'lost'}
    <LostDialog {closeDialog} />
{:else if dialog?.kind === 'delete'}
    <DeleteConfirmDialog {closeDialog} projectName={dialog.row.project}
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
</style>