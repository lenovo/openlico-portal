<template>
  <div class="p-b-20">
    <div class="m-t-10">
      <div :class="tags.length ? 'tag-comment-container' : 'no-comment'">
        <p class="job-info-label">
          {{ $t('Job.Tags') }}
        </p>
        <p v-if="tags.length" class="tag">
          <template v-for="tag in tags" :key="tag.id">
            <a-tag v-if="tag.show" closable @close.prevent="onDeleteTag([tag])">
              {{ tag.name }}
            </a-tag>
          </template>
        </p>
      </div>
      <div class="m-t-10" :class="tags.length ? 'tag-comment-button' : 'no-comment'">
        <a-button type="link" style="padding: 0" @click="onAddTags">
          {{ $t('JobManager.Add.Tags') }}
        </a-button>
        <a-button v-if="tags.length" type="link" style="padding: 0 10px; color: red" @click="onClearAllTags">
          {{ $t('JobManager.Clear.Tags') }}
        </a-button>
      </div>
    </div>
    <div class="m-t-10">
      <div :class="comment.length ? 'tag-comment-container' : 'no-comment'">
        <p class="job-info-label">
          {{ $t('Job.Comment') }}
        </p>
        <p v-if="comment.length" class="comment">
          {{ comment }}
        </p>
      </div>
      <div class="m-t-10" :class="comment.length ? 'tag-comment-button' : 'no-comment'">
        <a-button class="p-0-button m-r-10" type="link" @click="onEditComment">
          {{ $t('Action.Edit') }}
        </a-button>
      </div>
    </div>
    <job-tag-action-dialog ref="jobTagAction" />
    <job-comment-dialog ref="jobCommentDialog" />
  </div>
</template>
<script>
import JobService from '@/service/job'
import JobTagsActionDialog from '@/widget/job-tag-action-dialog.vue'
import JobCommentDialog from './job-comment-dialog.vue'
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import { createVNode } from 'vue'
import { h } from 'vue'

export default {
  components: {
    'job-tag-action-dialog': JobTagsActionDialog,
    'job-comment-dialog': JobCommentDialog,
  },
  props: ['job', 'detailInformation'],
  emits: ['refresh-job'],
  data() {
    return {
      tags: [],
      comment: '',
    }
  },
  watch: {
    job(val, old) {
      this.initTags()
      this.initComment()
    },
  },
  mounted() {
    this.initTags()
    this.initComment()
  },
  methods: {
    initTags() {
      this.tags = this.job.tags.map(tag => {
        tag.show = true
        return tag
      })
    },
    initComment() {
      this.comment = this.job.comment
    },
    onDeleteTag(tags, message) {
      this.$confirm({
        icon: createVNode(QuestionCircleOutlined),
        title: h(
          'div',
          {
            style: 'color: rgba(0,0,0,.65);font-size: 14px;font-weight: 400;',
          },
          message ||
            this.$T('JobManager.Tags.Delete.Confirm', {
              tag: tags[0].name,
            }),
        ),
        centered: true,
        okText: this.$t('Action.Confirm'),
        cancelText: this.$t('Action.Cancel'),
        onOk: () => {
          const tagName = tags.map(i => i.name)
          JobService.DeleteTagsforJob([this.job.id], tagName).then(
            res => {
              if (res.failed.length) {
                this.$message.error(this.$t('JobManager.Tags.Failed'))
              } else {
                this.$message.success(this.$t('JobManager.Tags.Success'))
                this.setUpdateImmediate()
                this.$emit('refresh-job')
              }
            },
            err => {
              this.$message.error(err)
            },
          )
        },
        onCancel: () => {
          this.initTags()
        },
      })
    },
    onAddTags() {
      this.$refs.jobTagAction.doAdd([this.job]).then(res => {
        this.setUpdateImmediate()
        this.$emit('refresh-job')
      })
    },
    onClearAllTags() {
      const message = this.$t('JobManager.Tags.Clear.Confirm')
      this.onDeleteTag(this.tags, message)
    },
    onEditComment() {
      this.$refs.jobCommentDialog.doEdit(this.job).then(res => {
        this.setUpdateImmediate()
        this.$emit('refresh-job')
      })
    },
    setUpdateImmediate() {
      window.gApp.updateImmediate = true
    },
  },
}
</script>
<style scoped>
.comment {
  word-break: break-word;
  color: #333;
}
.p-0-button {
  padding: 0;
}
.job-info-label {
  color: #999;
  font-size: 14px;
  width: 100px;
  margin-right: 20px;
}
.ai-studio-job-information {
  margin-top: 0;
  min-width: auto;
}
.tag-comment-button {
  margin-left: 120px;
}
.no-comment {
  margin-left: 0;
  display: inline-block;
}
.tag-comment-container {
  display: flex;
}
.tag-comment-container .ant-tag {
  color: #333;
}
.tag,
.comment {
  width: calc(100% - 120px);
}
</style>
