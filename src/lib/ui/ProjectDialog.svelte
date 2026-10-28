<script lang="ts">
    const { closeDialog } = $props();
</script>

<div class="wrap">
    <div class="board">
        <header>
            <input name="project-name" placeholder="Input project name" value="Project Name" />
        </header>
        <main>
            <p>Detail</p>
            <textarea></textarea>
        </main>
        <footer>
            <button class="cancel" onclick={closeDialog}>Cancel</button>
            <button class="ok" onclick={closeDialog}>OK</button>
        </footer>
    </div>
</div>

<style lang="scss">
    .wrap {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 24px;
        z-index: 9999;
    }
    .board {
        background-color: #f9f9f9;
        border-radius: 6px;
        min-width: 520px;
    }
    header {
        padding: 12px 24px;
        border-bottom: 1px solid #ddd;
    }
    main {
        padding: 12px 24px;
        & > p {
            margin: 0;
            font-size: 14px;
            font-weight: 600;
            color: #555;
        }
        & textarea {
            width: 100%;
            min-height: 160px;
            margin-top: 4px;
            padding: 8px;
            font-size: 15px;
            border: 1px solid #ccc;
        }
    }
    input {
        padding: 4px 0;
        width: 100%;
        border: 0;
        background-color: transparent;
        font-size: 16px;
        font-weight: 500;
        outline: none;
    }
    footer {
        padding: 0 24px 16px;
        display: flex;
        justify-content: flex-end;
        gap: 16px;
    }
    button {
        border: 0;
        border-radius: 4px;
        padding: 4px 12px;
        font-weight: 500;
        cursor: pointer;
        &.ok {
            background-color: #4090ea;
            color: #fff;
        }
        &.cancel {
            background-color: #ddd;
            color: #444;
        }
        &:hover {
            opacity: 0.85;
        }
    }
</style>