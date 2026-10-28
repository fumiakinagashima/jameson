<script lang="ts">
    import Table from "#lib/ui/Table.svelte";
    import Filter from "#lib/ui/Filter.svelte";
    import TaskDialog, { type TaskItem } from "#lib/ui/TaskDialog.svelte";
    import { Plus, Download, ListTodo } from '@lucide/svelte';

    // Sample data until the DB is wired up.
    let tasks: TaskItem[] = $state([
        { id: '1', project: 'My project', title: 'Send proposal', dueDate: '2026-10-30', doneAt: null },
        { id: '2', project: 'My project', title: 'Kickoff call', dueDate: '2026-10-20', doneAt: '2026-10-20' },
        { id: '3', project: 'Second deal', title: 'Follow up by email', dueDate: '2026-11-04', doneAt: null },
        { id: '4', project: 'Whistler', title: 'Confirm budget', dueDate: null, doneAt: null },
    ]);
    let openMyTasks = $state<boolean>(false);

    // Local date as 'YYYY-MM-DD'.
    const today = () => new Date().toLocaleDateString('sv-SE');
    const toggleTask = (task: TaskItem) => {
        const t = tasks.find((x) => x.id === task.id);
        if (t) t.doneAt = t.doneAt ? null : today();
    };
    const addTask = (project: string, input: { title: string; dueDate: string }) => {
        tasks.push({ id: crypto.randomUUID(), project, doneAt: null, ...input });
    };
    const deleteTask = (task: TaskItem) => {
        tasks = tasks.filter((t) => t.id !== task.id);
    };

    let data: { project: string; customer: string; note: string }[] = $state([
        { project: 'My project', customer: 'Lucy Inc.', note: '' },
        { project: 'Second deal', customer: 'Enver Inc.', note: 'My customer' },
        { project: 'St. James Gt', customer: 'Dublin riveties corporation', note: '' },
        { project: 'Independent', customer: 'Michil', note: '' },
        { project: 'Very rare', customer: 'Midleton', note: '' },
        { project: 'Whistler', customer: 'Boann', note: 'Waiting' },
    ]);
</script>

<div class="wrap">
    <div class="actions">
        <div class="filter-wrap">
            <Filter />
        </div>
        <div class="operation-wrap">
            <button class="outline" onclick={() => openMyTasks = true}>
                <ListTodo size={16} />My Tasks
            </button>

            <button class="outline">
                <Download size={16} />CSV Download
            </button>

            <button class="primary" onclick={() => data.unshift({
                project: 'New Project', customer: 'Customer', note: ''
            })}>
                <Plus size={16} />Create
            </button>
        </div>
    </div>
    <div class="table-wrap">
        <Table {data} {tasks} ondelete={(row) => data = data.filter((d) => d !== row)}
            ontasktoggle={toggleTask} ontaskadd={addTask} ontaskdelete={deleteTask} />
    </div>

</div>

{#if openMyTasks}
    <TaskDialog closeDialog={() => openMyTasks = false} title="My Tasks" {tasks} showProject ontoggle={toggleTask} ondelete={deleteTask} />
{/if}


<style lang="scss">
    .wrap {
        padding: 32px 24px;
        width: 100%;
        max-width: 1280px;
        margin: 0 auto;
    }
    .actions {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 16px;
    }
    
    .operation-wrap {
        margin-top: 16px;
        display: flex;
        justify-content: flex-end;
        gap: 16px;
    }
    button {
        display: flex;
        align-items: center;
        gap: 4px;
        border: 0;
        border-radius: 4px;
        padding: 6px 8px;
        font-weight: 500;
        line-height: 1;
        cursor: pointer;
    }
    button.primary {
        background-color: #4090ea;
        color: #fff;
    }
    button.outline {
        background-color: #fff;
        color: #333;
        border: 1px solid #aaa;
    }
</style>
