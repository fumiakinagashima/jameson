<script lang="ts">
    import { RefreshCw, X } from '@lucide/svelte';
    import { PROJECT_STATUSES, STATUS_LABELS } from '../status';
</script>

<div class="wrap">
    <div>
        <label for="text">Filter text</label>
        <input type="text" name="text" class="text" />
    </div>
    <div>
        <label for="status">Status</label>
        <select id="status" name="status">
            <option value=""></option>
            {#each PROJECT_STATUSES as st (st)}
                <option value={st}>{STATUS_LABELS[st]}</option>
            {/each}
        </select>
    </div>
    <div class="button-wrap">
        <button title="Reload search condition">
            <RefreshCw size={20} />
        </button>
        <button title="Clear search condition">
            <X size={20} />
        </button>
    </div>
    
</div>

<style lang="scss">
    .wrap {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: flex-end;
        gap: 8px;
    }
    label {
        display: block;
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 4px;
        color: #555;
    }
    div.button-wrap {
        display: flex;
        gap: 4px;
    }
    button {
        background-color: transparent;
        border: 0;
        width: 32px;
        height: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid #bbb;
        border-radius: 6px;
        color: #666;
        cursor: pointer;
        &:hover {
            background-color: #f5f5f5;
        }
    }
    select {
        padding: 6px;
        border: 1px solid #bbb;
        border-radius: 6px;
        font-weight: 600;
    }
    input {
        width: 100%;
        padding: 6px 8px;
        border-radius: 4px;
        border: 1px solid #bbb;
    }
    input.text {
        min-width: 350px;
    }
</style>