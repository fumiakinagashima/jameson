<script lang="ts">
    import Table from "#lib/ui/Table.svelte";
    import Filter from "#lib/ui/Filter.svelte";
</script>

<div class="wrap">
    <div class="filter-wrap">
        <Filter />
    </div>

    <div class="table-wrap">
        <Table />
    </div>
</div>


<style lang="scss">
    .wrap {
        padding: 32px 24px;
        width: fit-content;
        max-width: 1280px;
        margin: 0 auto;
    }
    .filter-wrap {
        margin-bottom: 16px;
    }
    
</style>
