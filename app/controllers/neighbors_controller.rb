class NeighborsController < ApplicationController
  before_filter :login_required
  
  def create
    neighbor = User.find(params[:user_id])
    myself = User.find(params[:my])
    unless Neighborhood.find(:first,:conditions => {:user_id => myself.id ,:neighbor_id => neighbor.id})
      @neighborhood = Neighborhood.new
      @neighborhood.user = myself
      @neighborhood.neighbor = neighbor
      @neighborhood.save!
      
      flash[:notice] = "您已关注了#{neighbor.login}"
      redirect_to user_url(neighbor)
    else
      flash[:notice] = "你已关注了#{neighbor.login}"
      redirect_to user_url(neighbor)
    end
    
  end
  
  def destroy
    neighbor = User.find(params[:user_id])
    myself = User.find(params[:id])
    @neighborhood = Neighborhood.delete_all(:user_id => myself.id, :neighbor_id => neighbor.id)
    flash[:notice] = "您已取消了对#{neighbor.login}的关注"
    redirect_to user_url(neighbor)
  end  
  
end