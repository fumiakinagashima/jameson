<script lang="ts">
    import { RefreshCw, X } from '@lucide/svelte';
</script>

<div class="wrap">
    <div>
        <label for="project">Project</label>
        <input type="text" name="project" />
    </div>
    <div>
        <label for="customer">Customer</label>
        <input type="text" name="customer" />
    </div>
    <div>
        <label for="status">Status</label>
        <select name="status">
            <option value="0"></option>
            <option value="1">Pending</option>
        </select>
    </div>
    <div>
        <label for="status">forecast</label>
        <select name="status">
            <option value="0"></option>
            <option value="1">20%</option>
        </select>
    </div>
    <div>
        <label for="representation">Representation</label>
        <input type="text" name="representation" />
    </div>
    <div>
        <label for="memo">Memo</label>
        <input type="text" name="memo" class="memo" />
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
        justify-content: space-between;
        align-items: flex-end;
        gap: 24px;
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
        border-radius: 4px;
        color: #666;
        cursor: pointer;
        &:hover {
            background-color: #f5f5f5;
        }
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
    input.memo {
        min-width: 250px;
    }
</style>