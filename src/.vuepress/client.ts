import {defineClientConfig} from 'vuepress/client'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import DataTable from '../components/DataTable.vue'

export default defineClientConfig({
    enhance({app}) {
        app.use(ElementPlus)
        for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
            app.component(key, component)
        }
        app.component('DataTable', DataTable)
    },
})