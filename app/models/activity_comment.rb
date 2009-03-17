class ActivityComment < Comment
  belongs_to :activity, :foreign_key => "type_id"
  belongs_to :user
  
  after_create :update_activity_comments_count
  
  def self.archives
    date_func = "extract(year from created_at) as year,extract(month from created_at) as month"
    
    counts = ActivityComment.find_by_sql(["select count(*) as count, #{date_func} from comments where created_at < ? group by year,month order by year asc,month asc",Time.now])
    
    sum = 0
    result = counts.map do |entry|
      sum += entry.count.to_i
      {
        :name => entry.year + "年" + entry.month + "月",
        :month => entry.month.to_i,
        :year => entry.year.to_i,
        :delta => entry.count,
        :sum => sum
      }
    end
    return result.reverse
  end
  
  private
  def update_activity_comments_count
    self.activity.update_attributes!(:comments_count => ActivityComment.count(:all, :conditions => ["type_id=?", self.activity.id]))
  end
  
end