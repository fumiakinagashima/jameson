<script lang="ts">
    import Table from "#lib/ui/Table.svelte";
    import Filter from "#lib/ui/Filter.svelte";
    import TaskDialog from "#lib/ui/TaskDialog.svelte";
    import { Plus, Download, ListTodo } from '@lucide/svelte';
    import { deserialize } from '$app/forms';
    import { goto, refreshAll } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { SvelteURLSearchParams } from 'svelte/reactivity';
    import type { PageProps } from './$types';

    const { data }: PageProps = $props();
    let openMyTasks = $state<boolean>(false);
    let message = $state<string>('');

    // The filter lives in the URL (`?q=&status=`), so it survives reloads and can be shared.
    const applyFilter = (filter: { text: string; status: string }) => {
        const params = new SvelteURLSearchParams();
        if (filter.text) params.set('q', filter.text);
        if (filter.status) params.set('status', filter.status);
        const query = params.toString();
        // resolve() takes a route, not a query string, so it is applied to the path only.
        // eslint-disable-next-line svelte/no-navigation-without-resolve
        goto(resolve('/') + (query ? `?${query}` : ''), { replace: true, reset: false });
    };

    // Calls a form action in +page.server.ts, then reloads the data.
    const act = async (name: string, values: Record<string, string> = {}) => {
        const body = new FormData();
        for (const [key, value] of Object.entries(values)) body.set(key, value);
        try {
            const res = await fetch(`?/${name}`, {
                method: 'POST',
                body,
                headers: { 'x-sveltekit-action': 'true' }
            });
            const result = deserialize(await res.text());
            message =
                result.type === 'failure' ? String(result.data?.message ?? 'Request failed.')
                : result.type === 'error' ? result.error.message
                : '';
        } catch {
            message = 'Network error.';
        }
        await refreshAll();
    };
</script>

<div class="wrap">
    <div class="actions">
        <div class="filter-wrap">
            <Filter
                text={data.filter.text}
                status={data.filter.status}
                onchange={applyFilter}
                onclear={() => goto(resolve('/'), { reset: false })} />
        </div>
        <div class="operation-wrap">
            <button class="outline" onclick={() => openMyTasks = true}>
                <ListTodo size={16} />My Tasks
            </button>

            <button class="outline">
                <Download size={16} />CSV Download
            </button>

            <button class="primary" onclick={() => act('createProject')}>
                <Plus size={16} />Create
            </button>
        </div>
    </div>
    {#if message}
        <p class="message">{message}</p>
    {/if}
    <div class="table-wrap">
        <Table
            data={data.projects}
            tasks={data.tasks}
            onstatus={(row, status) => act('updateStatus', { id: row.id, status })}
            onnote={(row, note) => act('updateNote', { id: row.id, note })}
            onproject={(row, v) => act('updateProject', { id: row.id, name: v.name, detail: v.detail })}
            oncustomer={(row, v) => act('updateCustomer', { id: row.id, customer: v.customer, detail: v.detail })}
            onwon={(row, v) => act('winProject', { id: row.id, closedAt: v.closedAt, amount: String(v.amount), note: v.note })}
            onlost={(row, v) => act('loseProject', { id: row.id, closedAt: v.closedAt, reason: v.reason })}
            ondelete={(row) => act('deleteProject', { id: row.id })}
            ontasktoggle={(task) => act('toggleTask', { id: task.id })}
            ontaskadd={(projectId, input) => act('addTask', { projectId, ...input })}
            ontaskdelete={(task) => act('deleteTask', { id: task.id })} />
    </div>

</div>

{#if openMyTasks}
    <TaskDialog closeDialog={() => openMyTasks = false} title="My Tasks" tasks={data.tasks} showProject
        ontoggle={(task) => act('toggleTask', { id: task.id })}
        ondelete={(task) => act('deleteTask', { id: task.id })} />
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
    
    .message {
        margin: 0 0 12px;
        font-size: 14px;
        color: #d33;
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
