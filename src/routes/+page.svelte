<script lang="ts">
    import Table from "#lib/ui/Table.svelte";
    import Filter from "#lib/ui/Filter.svelte";
    import TaskDialog from "#lib/ui/TaskDialog.svelte";
    import { Plus, Download, ListTodo } from '@lucide/svelte';
    import { deserialize } from '$app/forms';
    import { goto, refreshAll } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { SvelteURLSearchParams } from 'svelte/reactivity';
    import { m } from '#lib/paraglide/messages.js';
    import type { Sort, SortKey } from '#lib/project.ts';
    import type { PageProps } from './$types';

    const { data }: PageProps = $props();
    let openMyTasks = $state<boolean>(false);
    let message = $state<string>('');

    // The filter and the sort live in the URL (`?q=&status=&sort=&dir=`), so they survive
    // reloads and can be shared.
    type View = { text: string; status: string; sort: Sort };

    const viewQuery = (view: View) => {
        const params = new SvelteURLSearchParams();
        if (view.text) params.set('q', view.text);
        if (view.status) params.set('status', view.status);
        if (view.sort) {
            params.set('sort', view.sort.key);
            params.set('dir', view.sort.dir);
        }
        const query = params.toString();
        return query ? `?${query}` : '';
    };

    const showView = (view: View) => {
        // resolve() takes a route, not a query string, so it is applied to the path only.
        // eslint-disable-next-line svelte/no-navigation-without-resolve
        goto(resolve('/') + viewQuery(view), { replace: true, reset: false });
    };

    // Clicking a column cycles ascending, descending, then back to the default order.
    const sortBy = (key: SortKey) => {
        const current = data.sort;
        const sort: Sort =
            current?.key !== key ? { key, dir: 'asc' } : current.dir === 'asc' ? { key, dir: 'desc' } : null;
        showView({ ...data.filter, sort });
    };

    // Downloads the projects on screen, in the same order. The response is an attachment,
    // so the browser saves it and stays on this page.
    const downloadCsv = () => {
        window.location.assign(`/export.csv${viewQuery({ ...data.filter, sort: data.sort })}`);
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
                result.type === 'failure' ? String(result.data?.message ?? m.request_failed())
                : result.type === 'error' ? result.error.message
                : '';
        } catch {
            message = m.network_error();
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
                onchange={(filter) => showView({ ...filter, sort: data.sort })}
                onclear={() => showView({ text: '', status: '', sort: data.sort })} />
        </div>
        <div class="operation-wrap">
            <button class="outline" onclick={() => openMyTasks = true}>
                <ListTodo size={16} />{m.my_tasks()}
            </button>

            <button class="outline" onclick={downloadCsv}>
                <Download size={16} />{m.csv_download()}
            </button>

            <button class="primary" onclick={() => act('createProject')}>
                <Plus size={16} />{m.create()}
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
            sort={data.sort}
            onsort={sortBy}
            onstatus={(row, status) => act('updateStatus', { id: row.id, status })}
            onnote={(row, note) => act('updateNote', { id: row.id, note })}
            onproject={(row, v) => act('updateProject', { id: row.id, name: v.name, detail: v.detail })}
            oncustomer={(row, v) => act('updateCustomer', { id: row.id, customer: v.customer, detail: v.detail })}
            onwon={(row, v) => act('winProject', { id: row.id, closedOn: v.closedOn, amount: String(v.amount), note: v.note })}
            onlost={(row, v) => act('loseProject', { id: row.id, closedOn: v.closedOn, reason: v.reason })}
            ondelete={(row) => act('deleteProject', { id: row.id })}
            ontasktoggle={(task) => act('toggleTask', { id: task.id })}
            ontaskadd={(projectId, input) => act('addTask', { projectId, ...input })}
            ontaskdelete={(task) => act('deleteTask', { id: task.id })} />
    </div>

</div>

{#if openMyTasks}
    <TaskDialog closeDialog={() => openMyTasks = false} title={m.my_tasks()} tasks={data.tasks} showProject
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
