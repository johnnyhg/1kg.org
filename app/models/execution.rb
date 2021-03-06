class Execution < ActiveRecord::Base
  attr_accessor :agree_feedback_terms
  
  belongs_to :project
  belongs_to :school
  belongs_to :user
  belongs_to :village

  has_many :comments, :as => 'commentable', :dependent => :destroy
  has_many :photos, :order => "id desc", :dependent => :destroy
  has_many :shares, :order => "id desc", :dependent => :destroy
  
  validates_presence_of :reason,:message => "必须填写申请理由"
  validates_presence_of :plan,:message => "必须填写实施计划"
  validates_presence_of :telephone,:message => "请留下您的电话或手机号码"
  named_scope :state_is, lambda { |state| {:conditions => {:state => state} }}
  named_scope :validated, :conditions => ["state in (?)",["validated","going","finished"]]
  
  def validate
    #至少要关联一所学校或一所村庄
    if school_id.nil? && village.nil?
      errors.add(:village_id,"必须选择一所村庄")
      errors.add(:school_id,"必须选择一所学校")
    end
  end
  
  def community
    self.school ? self.school : self.village
  end
    
  def last_updated_at
    [self.created_at,self.last_modified_at,(self.shares.empty? ? nil : self.shares.last.created_at),(self.photos.empty? ? nil : self.photos.last.created_at)].compact.max
  end
  
  def validated?
    ["validated","going","finished"].include?(state)
  end

  def refused?
    state == "refused"
  end
  
  state_machine :state, :initial => :waiting do
  
    event :allow  do  
      transition [:refused,:waiting] => :validated
    end
    
    event :refuse do  
      transition [:waiting,:validated,:going] => :refused
    end
    
    event :start do  
      transition :validated => :going
    end  
        
    event :finish do  
      transition [:validated,:going] => :finished
    end
  end
  
end
