class Minisite::Musicclassroom::DashboardController < ApplicationController
  
  def index
    @project = Project.find(5)
    @photos = Photo.find(:all,:include => [:requirement],:conditions => ["stuff_bucks.type_id = ?",@project.id])
    @shares = Share.find(:all,:include => [:requirement],:conditions => ["stuff_bucks.type_id = ?",@project.id])
  end
  
end