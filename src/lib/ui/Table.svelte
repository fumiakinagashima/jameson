<script lang="ts">
    import ProjectDialog from './ProjectDialog.svelte';
    import { Ellipsis, ChevronsUpDown } from '@lucide/svelte';

    const status: { key: string; label: string }[] = [
      { key:'0', label:'Unset' },
      { key:'1', label:'Progress' },
      { key:'2', label:'Pending'},
      { key:'3', label:'Dealing'},
      { key:'4', label:'Following'},
    ];

    const data: { project: string; customer: string; representation: string; memo: string }[] = [
        { project: 'My project', customer: 'Lucy Inc.', representation: 'John Smith', memo: '' },
        { project: 'Second deal', customer: 'Enver Inc.', representation: 'Kelling Moth', memo: 'My customer' },
        { project: 'St. James Gt', customer: 'Dublin riveties corporation', representation: 'Young', memo: '' },
        { project: 'Independent', customer: 'Michil', representation: 'Nash Better', memo: '' },
        { project: 'Very rare', customer: 'Midleton', representation: 'Slaint Emma', memo: '' },
        { project: 'Whistler', customer: 'Boann', representation: 'Helis Node', memo: 'Waiting' },
    ];

    let openProjectDialog = $state<boolean>(false);
    const closeDialog = () => openProjectDialog = false;
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
                    Forecast <ChevronsUpDown size={16} />
                </button>
            </th>
            <th>
                <button>
                    Representation <ChevronsUpDown size={16} />
                </button>
            </th>
            <th class="memo">Memo</th>
            <th></th>
        </tr>
    </thead>
    <tbody>
        {#each data as d}
            <tr>
                <td><button class="text-link" onclick={() => openProjectDialog = true }>{d.project}</button></td>
                <td><button class="text-link">{d.customer}</button></td>
                <td>
                    <select>
                        {#each status as st (st.key)}
                            <option value={st.key}>{st.label}</option>
                        {/each}
                    </select>
                </td>
                <td>
                    <select>
                        <option value='0'>0%</option>
                        <option value='1'>20%</option>
                        <option value='2'>50%</option>
                        <option value='3'>80%</option>
                        <option value='4'>100%</option>
                    </select>
                </td>
                <td>
                    <button class="text-link">{d.representation}</button>
                </td>
                <td>
                    <input type="text" class="memo" value="{d.memo}" />
                </td>
                <td>
                    <button class="icon-button">
                        <Ellipsis size={16} />
                    </button>
                </td>
            </tr>
        {/each}
    </tbody>
</table>

{#if openProjectDialog}
    <ProjectDialog {closeDialog} />
{/if}

<style lang="scss">
    table {
        width: 100%;
        border-collapse: collapse;
        border-radius: 6px;
        & th {
            background-color: #f2f3f3;
            border-bottom: 2px solid #e2e2e2;
            text-align: left;
            padding: 8px 12px;
            font-size: 14px;
            border-radius: 6px;
            color: #080808;
            &.project-name {
                min-width: 260px;
            }
            &.customer {
                min-width: 250px;
            }
            &.memo {
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
    button.icon-button {
        background: transparent;
        border: 0;
        border-radius: 8px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
</style>